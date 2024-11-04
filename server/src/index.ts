import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import RedisStore from 'connect-redis';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import Redis from 'ioredis';
import { createClient } from 'redis';
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';
import { COOKIE_NAME, __prod__ } from './constants';
import { Post } from './entities/Post';
import { User } from './entities/User';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import { MyContext } from './types';

const main = async () => {
  // Set up TypeORM.
  const conn = await createConnection({
    type: 'postgres',
    database: 'redditclone',
    username: 'postgres',
    password: 'postgres',
    logging: true,
    synchronize: true,
    entities: [User, Post],
  });

  const app = express();

  // Set up Apollo Server.
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
  });
  await apolloServer.start();

  // Set up Redis.
  const redisClient = createClient();
  const redis = new Redis();
  redisClient.connect().catch(console.error);
  const redisStore = new RedisStore({
    client: redisClient,
    prefix: 'myapp:',
    disableTouch: true, // disable touch to prevent session expiration
  });

  // Start the server.
  app.listen(4000, () => {
    console.log(`🚀 Server ready at http://localhost:4000/graphql`);
  });

  // Set up express middleware for CORS.
  app.use(cors({ origin: 'http://localhost:3000', credentials: true })); // set middleware to allow requests from the frontend on all routes

  // Initialize session storage.
  app.use(
    session({
      name: COOKIE_NAME,
      store: redisStore,
      resave: false, // required: force lightweight session keep alive (touch)
      saveUninitialized: false, // recommended: only save session when data exists
      secret: 'keyboard cat',
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
    // cors<cors.CorsRequest>({ origin: 'http://localhost:3000' }), this would set allow requests only on this endpoint
    expressMiddleware(apolloServer, {
      context: async ({ req, res }): Promise<MyContext> => ({
        redis,
        req,
        res,
      }),
    })
  );
};

main().catch((err) => {
  console.error(err);
});
