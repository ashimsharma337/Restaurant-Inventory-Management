import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      light: '#25a7a3',
      main: '#0b5d5e',
      dark: '#073b3a',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#b66b16',
    },
    background: {
      default: '#fbfcfb',
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
});

export default theme;
