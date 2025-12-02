// Comentarios añadidos en español: entrada principal del frontend que monta React y Apollo.
// Cómo lo logra: importa `apolloClient`, envuelve `App` con `ApolloProvider` y renderiza en `#root`.
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ApolloProvider } from '@apollo/client/react'
import { apolloClient } from './lib/apollo-client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={apolloClient}>
      <App />
    </ApolloProvider>
  </React.StrictMode>,
)