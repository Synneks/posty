import { ChakraProvider } from '@chakra-ui/react';
import theme from '../theme';
import { AppProps } from 'next/app';
import { createClient, fetchExchange, Mutation, Provider } from 'urql';
import { Cache, cacheExchange, QueryInput } from '@urql/exchange-graphcache';
import {
  LoginMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
} from '../generated/graphql';

function betterUpdateQuery<Result, Query>(
  cache: Cache,
  queryInput: QueryInput,
  result: any,
  updateFunction: (result: Result, query: Query) => Query
) {
  return cache.updateQuery(
    queryInput,
    (data) => updateFunction(result, data as any) as any
  );
}

const urqlClient = createClient({
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
    fetchExchange,
  ],
  fetchOptions: {
    credentials: 'include',
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider value={urqlClient}>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </Provider>
  );
}

export default MyApp;
