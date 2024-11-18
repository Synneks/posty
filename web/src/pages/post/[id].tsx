import { Flex, Heading, Text } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import Layout from '../../components/Layout';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { useGetPostFromUrl } from '../../utils/useGetPostFromUrl';

const Post = () => {
  const [{ data, fetching }] = useGetPostFromUrl();

  if (fetching) {
    return <Layout>Loading post...</Layout>;
  }

  if (!data?.post) {
    return (
      <Layout>
        <Flex justifyContent={'center'}>Could not find post.</Flex>
      </Layout>
    );
  }

  return (
    <Layout>
      <Heading>{data.post.title}</Heading>
      <Text>{data.post.text}</Text>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
