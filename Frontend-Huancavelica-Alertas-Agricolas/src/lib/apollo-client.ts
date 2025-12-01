import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Determinar las URLs del backend GraphQL
const GRAPHQL_HTTP_ENDPOINT = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:3003/api/graphql';

// Crear el HTTP Link
const httpLink = createHttpLink({
  uri: GRAPHQL_HTTP_ENDPOINT,
});

// Middleware de autenticación para HTTP
const authLink = setContext((_, { headers }) => {
  // Obtener el token del localStorage
  const token = localStorage.getItem('auth_token');
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    }
  };
});

// Configurar el cliente Apollo (sin WebSocket por ahora)
export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          alerts: {
            merge(_existing = [], incoming: any) {
              return incoming;
            },
          },
          notifications: {
            merge(_existing = [], incoming: any) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});
