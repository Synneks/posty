import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { Flex, IconButton } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useDeletePostMutation, useMeQuery } from '../generated/graphql';

type EditDeletePostButtonsProps = {
  postId: number;
  creatorId: number;
};

const EditDeletePostButtons = ({
  postId,
  creatorId,
}: EditDeletePostButtonsProps) => {
  const [{ data: meData }] = useMeQuery();
  const [, deletePost] = useDeletePostMutation();
  return (
    <>
      {meData?.me?.id !== creatorId ? null : (
        <Flex alignItems={'center'} flexWrap={'nowrap'}>
          <IconButton
            aria-label="Edit Post"
            variant={'ghost'}
            icon={<EditIcon />}
            as={NextLink}
            href={`/post/edit/${postId}`}
          ></IconButton>
          <IconButton
            aria-label="Delete Post"
            variant={'ghost'}
            icon={<DeleteIcon />}
            onClick={() => {
              deletePost({ id: postId });
            }}
          ></IconButton>
        </Flex>
      )}
    </>
  );
};

export default EditDeletePostButtons;
