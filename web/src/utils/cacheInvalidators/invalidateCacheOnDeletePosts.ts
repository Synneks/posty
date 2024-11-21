import { Cache, Variables } from '@urql/exchange-graphcache';
import { DeletePostMutationVariables } from '../../generated/graphql';

export const invalidateCacheOnDeletePosts = (cache: Cache, args: Variables) => {
  const { id } = args as DeletePostMutationVariables;
  cache.invalidate({
    __typename: 'Post',
    id: id,
  });
};
