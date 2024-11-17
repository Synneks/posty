import { extendTheme } from '@chakra-ui/react';

const fonts = { mono: `'Menlo', monospace` };

const breakpoints = {
  sm: '40em',
  md: '52em',
  lg: '64em',
  xl: '80em',
};

const theme = extendTheme({
  semanticTokens: {
    colors: {
      text: {
        default: '#000000',
        _dark: '#ffffff',
      },
      primary: {
        default: '#7928CA',
        _dark: '#7928CA',
      },
      secondary: {
        default: '#eb8909',
        _dark: '#eb8909',
      },
      background: {
        default: '#ffffff',
        _dark: '#16161D',
      },
    },
    radii: {
      button: '12px',
    },
  },
  colors: {
    black: '#16161D',
  },
  fonts,
  breakpoints,
});

export default theme;
