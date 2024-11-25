import 'dotenv-safe/config';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import Redis from 'ioredis';
import 'reflect-metadata';
import { createApolloServer } from './apollo-server';
import { COOKIE_NAME, __prod__ } from './constants';
import { PostgresDataSource } from './datasource';
import { createRedisStore } from './redis';
import { MyContext } from './types';
import { createUpdootLoader } from './utils/createUpdootLoader';
import { createUserLoader } from './utils/createUserLoader';

const main = async () => {
  console.log(process.env);
  await initDB();

  const app = express();
  const apolloServer = await createApolloServer();
  const { redisStore, redis } = await setUpRedi();

  // Start the server.
  app.listen(process.env.PORT, () => {
    console.log(`🚀 Server ready at port ${process.env.PORT}`);
  });

  app.set('trust proxy', 1);

  // Set up express middleware for CORS as PostgresDataSource .
  app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true })); // set middleware to allow requests from the frontend on all routes

  // Initialize session storage.
  app.use(
    session({
      name: COOKIE_NAME,
      store: redisStore,
      resave: false, // required: force lightweight session keep alive (touch)
      saveUninitialized: false, // recommended: only save session when data exists
      secret: process.env.SESSION_SECRET,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true, // cookie only accessible by the web server (not JavaScript)
        sameSite: 'lax', // csrf
        secure: __prod__, // cookie only works in https
      },
    })
  );

  // Set up express middleware for Apollo Server.
  app.use(
    '/graphql',
    express.json(),
    // cors<cors.CorsRequest>({ origin: 'http://localhost:3000' })
    // would set allow requests only on this endpoint
    expressMiddleware(apolloServer, {
      context: async ({ req, res }): Promise<MyContext> => ({
        req,
        res,
        redis,
        userLoader: createUserLoader(),
        updootLoader: createUpdootLoader(),
      }),
    })
  );
};

const setUpRedi = async () => {
  const redisStore = await createRedisStore();
  const redis = new Redis(process.env.REDIS_URL);

  redis.on('connect', () => {
    console.log('Redis connected');
  });

  redis.on('error', (err) => {
    console.error('Redis error: ', err);
  });

  return { redisStore, redis };
};

const initDB = async () => {
  await PostgresDataSource.initialize()
    .then(() =>
      console.log(
        'Data Source has been initialized! Running migrations if needed...'
      )
    )
    .catch((err) =>
      console.error('Error during Data Source initialization', err)
    );

  await PostgresDataSource.runMigrations().then(() =>
    console.log('Migrations have been run!')
  );
};

main().catch((err) => {
  console.error(err);
});
