// Comentarios añadidos en español: consultas GraphQL (queries) usadas por Apollo Client.
// Cómo lo logra: define `gql` queries para alertas, notificaciones, zonas, usuarios y reportes.
import { gql } from '@apollo/client';

// ==================== ALERTAS ====================

export const GET_ALERTS = gql`
  query GetAlerts($filter: AlertFilterInput, $skip: Int, $take: Int) {
    alerts(filter: $filter, skip: $skip, take: $take) {
      id
      title
      description
      type
      severity
      status
      createdAt
      updatedAt
      zone {
        id
        name
        coordinates
      }
      meteorologicalData {
        temperature
        humidity
        precipitation
        windSpeed
      }
    }
  }
`;

export const GET_ALERT_BY_ID = gql`
  query GetAlertById($id: ID!) {
    alert(id: $id) {
      id
      title
      description
      type
      severity
      status
      createdAt
      updatedAt
      zone {
        id
        name
        coordinates
      }
      meteorologicalData {
        temperature
        humidity
        precipitation
        windSpeed
      }
      affectedCrops
      recommendations {
        id
        title
        description
        priority
      }
    }
  }
`;

export const GET_ALERT_RECOMMENDATIONS = gql`
  query GetAlertRecommendations($type: String!) {
    getAlertRecommendations(type: $type) {
      id
      title
      description
      priority
    }
  }
`;

// ==================== NOTIFICACIONES ====================

export const GET_NOTIFICATIONS = gql`
  query GetNotifications($userId: ID!, $skip: Int, $take: Int) {
    notifications(userId: $userId, skip: $skip, take: $take) {
      id
      title
      message
      type
      read
      createdAt
      alert {
        id
        title
        severity
      }
    }
  }
`;

export const GET_UNREAD_COUNT = gql`
  query GetUnreadCount($userId: ID!) {
    unreadNotificationsCount(userId: $userId)
  }
`;

// ==================== ZONAS ====================

export const GET_ZONES = gql`
  query GetZones {
    zones {
      id
      name
      coordinates
      province
      district
      alertsCount
      activeAlertsCount
    }
  }
`;

export const GET_ZONE_BY_ID = gql`
  query GetZoneById($id: ID!) {
    zone(id: $id) {
      id
      name
      coordinates
      province
      district
      description
      alerts {
        id
        title
        severity
        status
      }
    }
  }
`;

// ==================== USUARIOS ====================

export const GET_USERS = gql`
  query GetUsers($role: String, $skip: Int, $take: Int) {
    users(role: $role, skip: $skip, take: $take) {
      id
      name
      email
      phone
      role
      isActive
      createdAt
      zones {
        id
        name
      }
    }
  }
`;

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      id
      name
      email
      phone
      role
      avatar
      zones {
        id
        name
      }
      preferences {
        notifications
        language
      }
    }
  }
`;

// ==================== REPORTES ====================

export const GET_REPORT_DATA = gql`
  query GetReportData($crop: String!, $dateFrom: String!, $dateTo: String!) {
    reportData(crop: $crop, dateFrom: $dateFrom, dateTo: $dateTo) {
      date
      temperatura
      precipitacion
      humedad
      alertas
    }
  }
`;

export const GET_ANALYTICS = gql`
  query GetAnalytics($period: String!) {
    analytics(period: $period) {
      totalAlerts
      activeAlerts
      resolvedAlerts
      criticalAlerts
      alertsByType {
        type
        count
      }
      alertsBySeverity {
        severity
        count
      }
      alertsTrend {
        date
        count
      }
    }
  }
`;

// ==================== DASHBOARD ====================

export const GET_DASHBOARD_DATA = gql`
  query GetDashboardData {
    dashboardStats {
      totalAlerts
      activeAlerts
      criticalAlerts
      affectedZones
    }
    recentAlerts: alerts(take: 5, orderBy: { createdAt: desc }) {
      id
      title
      type
      severity
      status
      createdAt
      zone {
        name
      }
    }
    weatherForecast {
      date
      minTemp
      maxTemp
      precipitation
      condition
    }
  }
`;
