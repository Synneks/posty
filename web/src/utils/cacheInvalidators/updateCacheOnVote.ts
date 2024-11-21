import { Cache, Variables } from '@urql/exchange-graphcache';
import { gql } from 'urql';
import { VoteMutationVariables } from '../../generated/graphql';

export const updateCacheOnVote = (cache: Cache, args: Variables) => {
  const { postId, value } = args as VoteMutationVariables;

  const data = cache.readFragment(
    gql`
      fragment _ on Post {
        id
        points
        voteStatus
      }
    `,
    { id: postId } as any
  );

  if (data) {
    const points = Number(data.points);
    const voteStatus = Number(data.voteStatus);
    const newPoints =
      voteStatus === value
        ? points + -1 * value // undo vote
        : points + (!voteStatus ? 1 : 2) * value; // change vote
    cache.writeFragment(
      gql`
        fragment __ on Post {
          id
          points
          voteStatus
        }
      `,
      {
        id: postId,
        points: newPoints,
        voteStatus: value === voteStatus ? 0 : value,
      } as any
    );
  }
};
