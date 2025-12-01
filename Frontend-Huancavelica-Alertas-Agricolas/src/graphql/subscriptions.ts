import { gql } from '@apollo/client';

// ==================== SUSCRIPCIONES EN TIEMPO REAL ====================

// Subscription de alertas (coincide con backend)
export const ALERT_SUBSCRIPTION = gql`
  subscription OnNewAlert($zone: String) {
    onNewAlert(zone: $zone) {
      id
      title
      description
      type
      severity
      priority
      status
      time
      location
      zone
      reportedBy
      reportedAt
    }
  }
`;

// Alias para compatibilidad
export const ALERT_CREATED = ALERT_SUBSCRIPTION;

export const ALERT_UPDATED = gql`
  subscription OnAlertUpdated($alertId: ID) {
    alertUpdated(alertId: $alertId) {
      id
      title
      status
      updatedAt
    }
  }
`;

// Subscription de notificaciones (coincide con backend)
export const NOTIFICATION_SUBSCRIPTION = gql`
  subscription OnNotification($userId: String!) {
    onNotification(userId: $userId) {
      id
      type
      title
      message
      timestamp
      read
      priority
      userId
    }
  }
`;

// Alias para compatibilidad
export const NOTIFICATION_RECEIVED = NOTIFICATION_SUBSCRIPTION;
