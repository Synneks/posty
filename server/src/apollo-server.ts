import { ApolloServer } from '@apollo/server';
import { buildSchema } from 'type-graphql';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';

export const createApolloServer = async () => {
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: false,
    }),
  });
  await apolloServer.start();
  return apolloServer;
};
