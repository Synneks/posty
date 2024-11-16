import { Box, Button, Flex, Link } from '@chakra-ui/react';
import NextLink from 'next/link'; // enables client-side routing
import React, { useEffect, useState } from 'react';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = () => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching }] = useMeQuery({
    // fully optional since I am sending the cookie with the request the navbar can be rendered on the server, but I prefer not to
    pause: isServer(),
  });
  let body = null;

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  // data is loading
  if (fetching) {
    // user not logged in
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href={'/login'}>
          <Link mr={2}>Login</Link>
        </NextLink>
        <NextLink href={'/register'}>
          <Link>Register</Link>
        </NextLink>
      </>
    );
    // user is logged in
  } else {
    body = (
      <Flex>
        <Box mr={2}> {data.me.username}</Box>
        <Button
          variant={'link'}
          onClick={() => {
            logout({});
          }}
          isLoading={logoutFetching}
        >
          Logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex
      bg="purple.800"
      position={'sticky'}
      top={0}
      p={4}
      zIndex={999}
      color="white"
    >
      <Box ml={'auto'}>{body}</Box>
    </Flex>
  );
};
