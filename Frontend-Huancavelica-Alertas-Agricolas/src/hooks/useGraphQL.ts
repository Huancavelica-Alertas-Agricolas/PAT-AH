// Comentarios añadidos en español: hooks personalizados para GraphQL (queries, mutations, subscriptions).
// Cómo lo logra: envuelven `useQuery`, `useMutation` y `useSubscription` añadiendo manejo de errores y flags.
import { useQuery, useMutation, useSubscription } from '@apollo/client/react';
import type { OperationVariables } from '@apollo/client';
import { DocumentNode } from 'graphql';

/**
 * Hook personalizado para queries de GraphQL con manejo de errores
 */
export function useGraphQLQuery<TData = any, TVariables extends OperationVariables = OperationVariables>(
  query: DocumentNode,
  options?: any
) {
  const result = useQuery<TData, TVariables>(query, {
    ...options,
    onError: (error: any) => {
      console.error('GraphQL Query Error:', error);
      options?.onError?.(error);
    },
  });

  return {
    ...result,
    isLoading: result.loading,
    isError: !!result.error,
  };
}

/**
 * Hook personalizado para mutations de GraphQL con manejo de errores
 */
export function useGraphQLMutation<TData = any, TVariables extends OperationVariables = OperationVariables>(
  mutation: DocumentNode,
  options?: any
) {
  const [mutate, result] = useMutation<TData, TVariables>(mutation, {
    ...options,
    onError: (error: any) => {
      console.error('GraphQL Mutation Error:', error);
      options?.onError?.(error);
    },
  });

  return {
    mutate,
    ...result,
    isLoading: result.loading,
    isError: !!result.error,
  };
}

/**
 * Hook personalizado para subscriptions de GraphQL
 */
export function useGraphQLSubscription<TData = any, TVariables extends OperationVariables = OperationVariables>(
  subscription: DocumentNode,
  options?: any
) {
  const result = useSubscription<TData, TVariables>(subscription, {
    ...options,
    onError: (error: any) => {
      console.error('GraphQL Subscription Error:', error);
      // No llamar onError del options aquí porque useSubscription no lo soporta
    },
  });

  return {
    ...result,
    isLoading: result.loading,
    isError: !!result.error,
  };
}
