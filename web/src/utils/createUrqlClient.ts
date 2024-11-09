import { cacheExchange } from '@urql/exchange-graphcache';
import Router from 'next/router';
import { Exchange, fetchExchange, mapExchange } from 'urql';
import {
  LoginMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
} from '../generated/graphql';
import { betterUpdateQuery } from './betterUpdateQuery';

export const errorExchange: Exchange = mapExchange({
  onError(error) {
    if (error.message.includes('not authenticated')) {
      Router.replace('/login');
    }
  },
});

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
    errorExchange,
    ssrExchange,
    fetchExchange,
  ],
  fetchOptions: {
    credentials: 'include' as const,
  },
});
