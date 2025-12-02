// Comentarios añadidos en español: definiciones de tipos e interfaces usados por el frontend.
// Cómo lo logra: exporta `User`, `Alert`, `Zone`, permisos y tipos para tipado estático.
// Tipos del sistema de AlertaSegura
export type ViewType = 
  | 'dashboard' 
  | 'alerts' 
  | 'zones' 
  | 'analytics' 
  | 'reports'
  | 'users' 
  | 'roles' 
  | 'notifications' 
  | 'settings';

export type UserRole = 'administrador' | 'autoridad' | 'usuario';

export type AlertStatus = 'activa' | 'en-proceso' | 'resuelta';

export type AlertPriority = 'alta' | 'media' | 'baja';

export interface LoginFormPhone {
  phone: string;
  password: string;
}

// Mantener la interfaz antigua para compatibilidad
export interface OldLoginForm {
  email: string;
  password: string;
  remember: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  zone: string;
  status: 'activo' | 'inactivo';
  alertsReported: number;
  createdAt: string;
  avatar?: string;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  type: string;
  severity: string;
  status: AlertStatus;
  priority: AlertPriority;
  location: string;
  coordinates: [number, number];
  reportedBy: string;
  reportedAt: string;
  time: string;
  zone: string;
  resolvedAt?: string;
  resolvedBy?: string;
  responseTime?: number;
}

export interface Zone {
  id: string;
  name: string;
  coordinates: string;
  area: number; // en km²
  population: number;
  activeAlerts: number;
  status: 'alta-actividad' | 'media-actividad' | 'baja-actividad';
  mapPosition: [number, number];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'alerta' | 'exito' | 'advertencia' | 'informacion';
  priority: AlertPriority;
  read: boolean;
  createdAt: string;
}

export interface DashboardStats {
  activeAlerts: number;
  resolvedToday: number;
  inProcess: number;
  activeUsers: number;
  alertsTrend: number;
  resolvedTrend: number;
  processTrend: number;
  usersTrend: number;
}

export interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}

// Permisos del sistema
export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface RolePermissions {
  role: UserRole;
  permissions: string[];
}