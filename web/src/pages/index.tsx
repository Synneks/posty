import { Box, Button, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';
import Layout from '../components/Layout';
import { usePostsQuery } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';

const Index = () => {
  const [{ data, fetching }] = usePostsQuery({
    variables: { limit: 10 },
  });

  if (!fetching && !data) {
    return <div>Error when loading data</div>;
  }

  return (
    <Layout>
      <Flex justifyContent={'space-between'}>
        <Heading>Reddit Clone</Heading>
        <NextLink href="/create-post">
          <Button bg="#7928CA">Create Post</Button>
        </NextLink>
      </Flex>
      <div>
        <Heading fontSize={'2xl'} py={2}>
          Most recent posts
        </Heading>
        {!data && fetching ? (
          <div>Loading...</div>
        ) : !data || data.posts.length === 0 ? (
          <div>No posts found</div>
        ) : (
          <>
            <Stack spacing={4}>
              {data.posts.map((p) => (
                <Box
                  key={p.id}
                  p={4}
                  borderWidth={2}
                  shadow={'md'}
                  borderRadius={'md'}
                >
                  <Heading fontSize={'xl'}>{p.title}</Heading>
                  <Text mt={4}>{p.textSnippet}...</Text>
                </Box>
              ))}
            </Stack>
            <Flex>
              <Button m={'auto'} my={4}>
                Load More
              </Button>
            </Flex>
          </>
        )}
      </div>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
