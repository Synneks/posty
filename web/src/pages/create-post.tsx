import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import InputField from '../components/InputField';
import Wrapper from '../components/Wrapper';
import { useCreatePostMutation } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';

const CreatePost: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [, createPost] = useCreatePostMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ title: '', text: '' }}
        onSubmit={async (values) => {
          await createPost({ input: values });
          router.push('/');
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="title" placeholder="Post title" label="Title" />

            <Box mt={4}>
              <InputField
                textarea
                size="lg"
                name="text"
                placeholder="Post content..."
                label="Body"
              />
            </Box>

            <Button
              type="submit"
              mt={4}
              color={'teal'}
              isLoading={isSubmitting}
            >
              Create Post
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(CreatePost);
