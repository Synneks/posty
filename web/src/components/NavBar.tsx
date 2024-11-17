import { Box, Button, Flex, Heading, Highlight, Link } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';
import NextLink from 'next/link';

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
        <Link as={NextLink} mr={2} href={'/login'}>
          Login
        </Link>
        <Link href={'/register'}>Register</Link>
      </>
    );
    // user is logged in
  } else {
    body = (
      <Flex alignItems={'center'} justifyContent={'space-around'} gap={4}>
        <Link>
          <Button as={NextLink} href={'/create-post'}>
            Create Post{' '}
          </Button>
        </Link>

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
      alignItems={'center'}
      justify={'space-around'}
    >
      <Link as={NextLink} href="/">
        <Heading>
          <Highlight query={'Clone'} styles={{ color: 'background' }}>
            Reddit Clone
          </Highlight>
        </Heading>
      </Link>
      <Box>{body}</Box>
    </Flex>
  );
};
