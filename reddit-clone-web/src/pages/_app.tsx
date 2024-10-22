import { ChakraProvider } from '@chakra-ui/react';

import theme from '../theme';
import { AppProps } from 'next/app';
import { createClient, fetchExchange, Provider } from 'urql';
import { cacheExchange } from '@urql/exchange-graphcache';

const urqlClient = createClient({
  url: 'http://localhost:4000/graphql',
  exchanges: [cacheExchange(), fetchExchange],
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
