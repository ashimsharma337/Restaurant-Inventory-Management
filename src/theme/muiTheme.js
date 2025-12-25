import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1e3a8a',
    },
    secondary: {
      main: '#f59e0b',
    },
    background: {
      default: '#f9fafb',
    },
  },
  typography: {
    fontFamily: 'Inter, Roboto, sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
});

export default theme;
