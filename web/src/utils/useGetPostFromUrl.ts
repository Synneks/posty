import { useRouter } from 'next/router';
import { usePostQuery } from '../generated/graphql';
import { useGetIntId } from './useGetIntId';

export const useGetPostFromUrl = () => {
  const intId = useGetIntId();
  return usePostQuery({
    pause: intId === -1, // pause the query if the id is unparsable
    variables: {
      id: intId,
    },
  });
};
