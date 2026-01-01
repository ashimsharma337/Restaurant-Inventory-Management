import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const client = new ApolloClient({
  link: new HttpLink({
    uri: '/api/graphql', // Apollo Server endpoint
    credentials: 'same-origin',
  }),
  cache: new InMemoryCache(),
});

export default client;
