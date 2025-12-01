// Comentarios añadidos en español: mutaciones GraphQL para acciones (login, crear alertas, usuarios, etc.).
// Cómo lo logra: define `gql` mutations usadas por Apollo Client para modificar datos en el backend.
import { gql } from '@apollo/client';

// ==================== AUTENTICACIÓN ====================

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        nombre
        email
        telefono
        roles
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($phone: String!, $password: String!) {
    login(phone: $phone, password: $password) {
      token
      user {
        id
        nombre
        email
        telefono
        roles
      }
    }
  }
`;

export const RECOVER_PASSWORD = gql`
  mutation RecoverPassword($identifier: String!, $method: String!) {
    recoverPassword(identifier: $identifier, method: $method)
  }
`;

export const VERIFY_CODE = gql`
  mutation VerifyCode($phone: String!, $code: String!) {
    verifyCode(phone: $phone, code: $code)
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword)
  }
`;

// ==================== ALERTAS ====================

export const CREATE_ALERT = gql`
  mutation CreateAlert($input: CreateAlertInput!) {
    createAlert(input: $input) {
      id
      title
      description
      type
      severity
      status
      createdAt
    }
  }
`;

export const UPDATE_ALERT = gql`
  mutation UpdateAlert($id: ID!, $input: UpdateAlertInput!) {
    updateAlert(id: $id, input: $input) {
      id
      title
      description
      status
      updatedAt
    }
  }
`;

export const DELETE_ALERT = gql`
  mutation DeleteAlert($id: ID!) {
    deleteAlert(id: $id) {
      success
      message
    }
  }
`;

export const RESOLVE_ALERT = gql`
  mutation ResolveAlert($id: ID!) {
    resolveAlert(id: $id) {
      id
      status
      resolvedAt
    }
  }
`;

// ==================== NOTIFICACIONES ====================

export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id) {
      id
      read
    }
  }
`;

export const MARK_ALL_READ = gql`
  mutation MarkAllNotificationsRead($userId: ID!) {
    markAllNotificationsRead(userId: $userId) {
      success
      count
    }
  }
`;

export const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($id: ID!) {
    deleteNotification(id: $id) {
      success
    }
  }
`;

// ==================== USUARIOS ====================

export const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      email
      phone
      role
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      name
      email
      phone
      role
      isActive
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      success
      message
    }
  }
`;

// ==================== ZONAS ====================

export const CREATE_ZONE = gql`
  mutation CreateZone($input: CreateZoneInput!) {
    createZone(input: $input) {
      id
      name
      coordinates
      province
      district
    }
  }
`;

export const UPDATE_ZONE = gql`
  mutation UpdateZone($id: ID!, $input: UpdateZoneInput!) {
    updateZone(id: $id, input: $input) {
      id
      name
      coordinates
      province
      district
    }
  }
`;

export const DELETE_ZONE = gql`
  mutation DeleteZone($id: ID!) {
    deleteZone(id: $id) {
      success
      message
    }
  }
`;

// ==================== REPORTES ====================

export const GENERATE_REPORT = gql`
  mutation GenerateReport($crop: String!, $dateFrom: String!, $dateTo: String!) {
    generateReport(crop: $crop, dateFrom: $dateFrom, dateTo: $dateTo) {
      id
      url
      expiresAt
    }
  }
`;
