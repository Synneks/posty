import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { useRouter } from 'next/router';
import { usePostQuery } from '../../generated/graphql';
import Layout from '../../components/Layout';
import { Flex, Heading, Text } from '@chakra-ui/react';

const Post = () => {
  const router = useRouter();
  const intId =
    typeof router.query.id === 'string' ? parseInt(router.query.id) : -1;
  const [{ data, error, fetching }] = usePostQuery({
    pause: intId === -1, // pause the query if the id is unparsable
    variables: {
      id: intId,
    },
  });

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
