import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { Flex, IconButton } from '@chakra-ui/react';
import { useState } from 'react';
import { PostSnippetFragment, useVoteMutation } from '../generated/graphql';

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
    >
      <IconButton
        aria-label="updoot"
        variant={post.voteStatus === 1 ? 'outline' : 'ghost'}
        colorScheme={post.voteStatus === 1 ? 'teal' : undefined}
        icon={<ChevronUpIcon />}
        borderBottom={'none'}
        isLoading={loadingState === 'updoot-loading'}
        onClick={async () => {
          setLoadingState('updoot-loading');
          await vote({ postId: post.id, value: 1 });
          setLoadingState('not-loading');
        }}
      />
      <Flex
        fontSize={'xs'}
        height={'40px'}
        width={'40px'}
        justifyContent={'center'}
        alignItems={'center'}
      >
        {post.points}
      </Flex>
      <IconButton
        aria-label="downdoot"
        variant={post.voteStatus === -1 ? 'outline' : 'ghost'}
        colorScheme={post.voteStatus === -1 ? 'red' : undefined}
        icon={<ChevronDownIcon />}
        borderTop={'none'}
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
