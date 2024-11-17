import { Box, Button, Link } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import { useState } from 'react';
import InputField from '../../components/InputField';
import Wrapper from '../../components/Wrapper';
import { useChangePasswordMutation } from '../../generated/graphql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { toErrorMap } from '../../utils/toErrorMap';
import NextLink from 'next/link';

function ChangePassword() {
  const router = useRouter();
  const [, changePassword] = useChangePasswordMutation();
  const [tokenError, setTokenError] = useState('');

  return (
    <>
      <Wrapper variant="small">
        <Formik
          initialValues={{ newPassword: '' }}
          onSubmit={async (values, actions) => {
            const response = await changePassword({
              newPassword: values.newPassword,
              token: router.query.token as string,
            });

            if (response.data?.changePassword.errors) {
              const errorMap = toErrorMap(response.data.changePassword.errors);
              if ('token' in errorMap) {
                setTokenError(errorMap.token);
              } else {
                actions.setErrors(errorMap);
              }
            } else if (response.data?.changePassword.user) {
              // worked
              router.push('/');
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <InputField
                name="newPassword"
                placeholder="new password"
                label="New Password"
                type="password"
              />
              {tokenError && (
                <Box>
                  <Box color="red">{tokenError}</Box>
                  <Link as={NextLink} href="/forgot-password">
                    Click here to try again
                  </Link>
                </Box>
              )}
              <Button
                type="submit"
                mt={4}
                color={'teal'}
                isLoading={isSubmitting}
              >
                Change Password
              </Button>
            </Form>
          )}
        </Formik>
      </Wrapper>
      <div>Reset Password with token: {router.query.token}</div>;
    </>
  );
}

export default withUrqlClient(createUrqlClient, { ssr: false })(ChangePassword);
