import { Box, Button, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import { useState } from 'react';
import Layout from '../components/Layout';
import { VoteSection } from '../components/VoteSection';
import { usePostsQuery } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: null as null | string,
  });
  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

  if (!fetching && !data) {
    return <div>Error when loading data</div>;
  }

  return (
    <Layout>
      <Box>
        <Heading fontSize={'2xl'} py={2}>
          Most recent posts
        </Heading>
        {!data && fetching ? (
          <div>Loading...</div>
        ) : !data || data.posts.posts.length === 0 ? (
          <div>No posts found</div>
        ) : (
          <>
            <Stack spacing={4}>
              {data.posts.posts.map((p) => (
                <Flex
                  key={p.id}
                  p={4}
                  borderWidth={2}
                  shadow={'md'}
                  borderRadius={'md'}
                >
                  <VoteSection post={p} />
                  <Box ml={4}>
                    <Heading fontSize={'xl'}>{p.title}</Heading>
                    <Text fontSize={'sm'}>Posted by {p.creator.username}</Text>
                    <Text mt={4}>
                      {p.textSnippet}
                      {p.textSnippet.length === 128 ? <>...</> : null}
                    </Text>
                  </Box>
                </Flex>
              ))}
            </Stack>
            {data.posts.hasMore ? (
              <Flex>
                <Button
                  m={'auto'}
                  my={4}
                  onClick={() =>
                    setVariables({
                      limit: variables.limit,
                      cursor:
                        data.posts.posts[data.posts.posts.length - 1].createdAt,
                    })
                  }
                >
                  Load More
                </Button>
              </Flex>
            ) : null}
          </>
        )}
      </Box>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
