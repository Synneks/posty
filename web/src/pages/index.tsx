import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Stack,
  Text,
} from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import { useState } from 'react';
import Layout from '../components/Layout';
import { VoteSection } from '../components/VoteSection';
import {
  useDeletePostMutation,
  useMeQuery,
  usePostsQuery,
} from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import NextLink from 'next/link';

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: null as null | string,
  });
  const [{ data: meData }] = useMeQuery();
  const [{ data: postsData, fetching }] = usePostsQuery({
    variables,
  });

  const [, deletePost] = useDeletePostMutation();

  if (!fetching && !postsData) {
    return <div>Error when loading data</div>;
  }

  return (
    <Layout>
      <Box>
        <Heading fontSize={'2xl'} py={2}>
          Most recent posts
        </Heading>
        {!postsData && fetching ? (
          <div>Loading...</div>
        ) : !postsData || postsData.posts.posts.length === 0 ? (
          <div>No posts found</div>
        ) : (
          <>
            <Stack spacing={4}>
              {postsData.posts.posts.map((p) =>
                !p ? null : (
                  // Post Card
                  <Flex
                    key={p.id}
                    p={4}
                    borderWidth={2}
                    shadow={'md'}
                    borderRadius={'md'}
                  >
                    <VoteSection post={p} />
                    <Box ml={4} flex={1}>
                      <Heading fontSize={'xl'}>{p.title}</Heading>
                      <Text fontSize={'sm'}>
                        Posted by {p.creator.username}
                      </Text>
                      <Flex justifyContent={'space-between'}>
                        <Text mt={4}>
                          {p.textSnippet}
                          {p.textSnippet.length === 128 ? <>...</> : null}
                        </Text>
                        {meData?.me?.id !== p.creatorId ? null : (
                          <Flex mt={'auto'} flexWrap={'nowrap'}>
                            <IconButton
                              aria-label="Edit Post"
                              variant={'ghost'}
                              icon={<EditIcon />}
                              as={NextLink}
                              href={`/post/edit/${p.id}`}
                            ></IconButton>
                            <IconButton
                              aria-label="Delete Post"
                              variant={'ghost'}
                              icon={<DeleteIcon />}
                              onClick={() => {
                                deletePost({ id: p.id });
                              }}
                            ></IconButton>
                          </Flex>
                        )}
                      </Flex>
                    </Box>
                  </Flex>
                )
              )}
            </Stack>
            {postsData.posts.hasMore ? (
              <Flex>
                <Button
                  m={'auto'}
                  my={4}
                  onClick={() =>
                    setVariables({
                      limit: variables.limit,
                      cursor:
                        postsData.posts.posts[postsData.posts.posts.length - 1]
                          .createdAt,
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
