import { Link } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';
import Layout from '../components/Layout';
import { usePostsQuery } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';

const Index = () => {
  const [{ data, fetching }] = usePostsQuery({});
  return (
    <Layout>
      <NextLink href="/create-post">
        <Link>Create Post</Link>
      </NextLink>
      <br />
      <div>
        <h1>Posts</h1>
        {fetching ? (
          <div>Loading...</div>
        ) : !data || data.posts.length === 0 ? (
          <div>No posts found</div>
        ) : (
          <ul>
            {data.posts.map((p) => (
              <li key={p.id}>{p.title}</li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
