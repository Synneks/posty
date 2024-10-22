import { Box, Flex, Link } from '@chakra-ui/react';
import React from 'react';
import NextLink from 'next/link'; // enables client-side routing

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = () => {
  return (
    <Flex bg="tomato" p={4} color="white">
      <Box ml={'auto'}>
        <NextLink href={'/login'}>
          <Link mr={2}>Login</Link>
        </NextLink>

        <NextLink href={'/register'}>
          <Link>Register</Link>
        </NextLink>
      </Box>
    </Flex>
  );
};
