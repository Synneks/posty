import { withUrqlClient } from 'next-urql';
import { NavBar } from '../components/NavBar';
import { usePostsQuery } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';

const Index = () => {
  const [{ data, fetching }] = usePostsQuery({});
  return (
    <>
      <NavBar />
      <div>Hellow</div>
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
    </>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
