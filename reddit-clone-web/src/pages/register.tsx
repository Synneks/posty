import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Button,
  Box,
} from '@chakra-ui/react';
import { Field, Form, Formik } from 'formik';
import React from 'react';
import Wrapper from '../components/Wrapper';
import InputField from '../components/InputField';
import { useMutation } from 'urql';

interface registerProps {}

const REGISTER_MUTATION = `mutation RegisterMutation($registerOptions: UsernamePasswordInput!) {
  register(options: $registerOptions) {
    user {
      id
      username
    }
    errors {
      field
      message
    }
  }
}`;

const Register: React.FC<registerProps> = () => {
  const [, register] = useMutation(REGISTER_MUTATION);
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: '', password: '' }}
        onSubmit={(values, actions) => {
          console.log(values);
          return register({ registerOptions: values });
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="username"
              placeholder="username"
              label="Username"
            />

            <Box mt={4}>
              <InputField
                name="password"
                placeholder="password"
                label="Password"
                type="password"
              />
            </Box>

            <Button
              type="submit"
              mt={4}
              color={'teal'}
              isLoading={isSubmitting}
            >
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Register;
