import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { Flex, IconButton, Text } from '@chakra-ui/react';
import { PostSnippetFragment, useVoteMutation } from '../generated/graphql';
import { useState } from 'react';

interface VoteSectionProps {
  post: PostSnippetFragment;
}

export const VoteSection: React.FC<VoteSectionProps> = ({ post }) => {
  const [loadingState, setLoadingState] = useState<
    'updoot-loading' | 'downdoot-loading' | 'not-loading'
  >();
  // loading state can be set using the fetching and operation properties of the useMutation hook
  // but they are not typed properly :(
  const [, vote] = useVoteMutation();

  return (
    <Flex
      alignItems={'center'}
      flexDirection={'column'}
      justifyContent={'center'}
      mr={4}
    >
      <IconButton
        aria-label="updoot"
        variant={post.voteStatus === 1 ? 'solid' : 'ghost'}
        colorScheme={post.voteStatus === 1 ? 'green' : undefined}
        icon={<ChevronUpIcon />}
        isLoading={loadingState === 'updoot-loading'}
        onClick={async () => {
          setLoadingState('updoot-loading');
          await vote({ postId: post.id, value: 1 });
          setLoadingState('not-loading');
        }}
      />
      <Text fontSize={'xs'}>{post.points}</Text>
      <IconButton
        aria-label="downdoot"
        variant={post.voteStatus === -1 ? 'solid' : 'ghost'}
        colorScheme={post.voteStatus === -1 ? 'red' : undefined}
        icon={<ChevronDownIcon />}
        isLoading={loadingState === 'downdoot-loading'}
        onClick={async () => {
          setLoadingState('downdoot-loading');
          await vote({ postId: post.id, value: -1 });
          setLoadingState('not-loading');
        }}
      />
    </Flex>
  );
};
