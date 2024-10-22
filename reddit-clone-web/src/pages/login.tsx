import { Button, Box } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import React from "react";
import Wrapper from "../components/Wrapper";
import InputField from "../components/InputField";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
import { useLoginMutation } from "../generated/graphql";

interface loginProps {}

const Login: React.FC<loginProps> = () => {
  const router = useRouter();
  const [, register] = useLoginMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={async (values, actions) => {
          const response = await register({ loginOptions: values });
          if (response.data?.login.errors) {
            actions.setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
            // worked
            router.push("/");
          }
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
              color={"teal"}
              isLoading={isSubmitting}
            >
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Login;
