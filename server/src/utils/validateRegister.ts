import { UsernamePasswordInput } from 'src/resolvers/UsernamePasswordInput';

export const validateRegister = (options: UsernamePasswordInput) => {
  if (!options.email.includes('@')) {
    return [
      {
        field: 'email',
        message: 'Email must be valid',
      },
    ];
  }

  if (options.username.length <= 2) {
    return [
      {
        field: 'username',
        message: 'Username must be longer than 2 characters',
      },
    ];
  }

  if (options.username.includes('@')) {
    return [
      {
        field: 'username',
        message: 'Username cannot include an @',
      },
    ];
  }

  if (options.password.length <= 2) {
    return [
      {
        field: 'password',
        message: 'Password must be longer than 2 characters',
      },
    ];
  }

  return null;
};
