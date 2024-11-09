import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useMeQuery } from '../generated/graphql';

export const useIsAuth = () => {
  const [{ data, fetching }] = useMeQuery();
  const router = useRouter();
  console.log('useIsAuth');

  useEffect(() => {
    console.log('uite fac caca');
    if (!fetching && !data?.me) {
      // after login redirect back to the page user was trying to access
      router.replace('/login?next=' + router.pathname);
    }
  }, [fetching, data, router]);
};
