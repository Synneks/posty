import { cacheExchange } from '@urql/exchange-graphcache';
import { fetchExchange, SSRExchange } from 'urql';
import { betterUpdateQuery } from './betterUpdateQuery';
import {
  LoginMutation,
  MeQuery,
  MeDocument,
  RegisterMutation,
} from '../generated/graphql';

export const createUrqlClient = (ssrExchange: any) => ({
  url: 'http://localhost:4000/graphql',
  exchanges: [
    cacheExchange({
      updates: {
        Mutation: {
          login(_result, _args, cache, _info) {
            betterUpdateQuery<LoginMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (result.login.errors) {
                  return query;
                } else {
                  return {
                    __typename: 'Query',
                    me: result.login.user,
                  };
                }
              }
            );
          },
          register(_result, _args, cache, _info) {
            betterUpdateQuery<RegisterMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (result.register.errors) {
                  return query;
                } else {
                  return {
                    __typename: 'Query',
                    me: result.register.user,
                  };
                }
              }
            );
          },
          logout(_result, _args, cache, _info) {
            betterUpdateQuery<RegisterMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              () => ({ me: null }) // set me to null
            );
          },
        },
      },
    }),
    ssrExchange,
    fetchExchange,
  ],
  fetchOptions: {
    credentials: 'include' as const,
  },
});
