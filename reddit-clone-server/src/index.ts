import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
import { __prod__ } from './constants';
import mikroOrmConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { expressMiddleware } from '@apollo/server/express4';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import RedisStore from 'connect-redis';
import session from 'express-session';
import { createClient } from 'redis';
import { MyContext } from './types';

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);

  await orm.getMigrator().up();

  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
  });
  await apolloServer.start();

  const redisClient = createClient();
  redisClient.connect().catch(console.error);
  const redisStore = new RedisStore({
    client: redisClient,
    prefix: 'myapp:',
    disableTouch: true, // disable touch to prevent session expiration
  });

  app.listen(4000, () => {
    console.log(`🚀 Server ready at http://localhost:4000/graphql`);
  });

  // Initialize session storage.
  app.use(
    session({
      name: 'qid',
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

  app.use(
    '/graphql',
    express.json(),
    expressMiddleware(apolloServer, {
      context: async ({ req, res }): Promise<MyContext> => ({
        em: orm.em.fork(),
        req,
        res,
      }),
    })
  );
};

main().catch((err) => {
  console.error(err);
});
