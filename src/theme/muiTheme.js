import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      light: '#0f6e6e',
      main: '#073838',
      dark: '#052626',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#8a5300',
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
