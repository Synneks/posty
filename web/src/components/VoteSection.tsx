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
        aria-label="Updoot"
        variant={post.voteStatus === 1 ? 'outline' : 'ghost'}
        color={post.voteStatus === 1 ? 'green' : undefined}
        borderColor={post.voteStatus === 1 ? 'green' : 'transparent'}
        borderBottom={'none'}
        icon={<ChevronUpIcon />}
        isLoading={loadingState === 'updoot-loading'}
        onClick={async () => {
          setLoadingState('updoot-loading');
          await vote({ postId: post.id, value: 1 });
          setLoadingState('not-loading');
        }}
      />
      <Flex
        fontSize={'xs'}
        m={2}
        justifyContent={'center'}
        alignItems={'center'}
      >
        {post.points}
      </Flex>
      <IconButton
        aria-label="Downdoot"
        variant={post.voteStatus === -1 ? 'outline' : 'ghost'}
        color={post.voteStatus === -1 ? 'red.500' : undefined}
        borderColor={post.voteStatus === -1 ? 'red.500' : 'transparent'}
        borderTop={'none'}
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
