import '@/styles/globals.scss';
import '@/styles/layout.scss';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/theme/muiTheme';
import { ApolloProvider } from '@apollo/client/react';
import client from '@/graphql/client/apolloClient';

export default function App({ Component, pageProps }) {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </ApolloProvider>
  );
}
