import { User, Alert, Zone, Notification, DashboardStats, Permission, RolePermissions } from '../types';

// Datos mock de usuarios
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin SENAMHI',
    email: 'admin@senamhi.gob.pe',
    phone: '+51 999 123 456',
    role: 'administrador',
    zone: 'Centro',
    status: 'activo',
    alertsReported: 0,
    createdAt: '2024-01-15T10:00:00Z',
    avatar: 'A'
  },
  {
    id: '2',
    name: 'Ing. Carlos Mendoza',
    email: 'cmendoza@agraria.gob.pe',
    phone: '+51 999 654 321',
    role: 'autoridad',
    zone: 'Centro',
    status: 'activo',
    alertsReported: 5,
    createdAt: '2024-02-10T14:30:00Z',
    avatar: 'C'
  },
  {
    id: '3',
    name: 'María García',
    email: 'mgarcia@agricultora.pe',
    phone: '+51 999 789 123',
    role: 'usuario',
    zone: 'Norte',
    status: 'activo',
    alertsReported: 12,
    createdAt: '2024-03-05T09:15:00Z',
    avatar: 'M'
  },
  {
    id: '4',
    name: 'José Quispe',
    email: 'jquispe@comunero.pe',
    phone: '+51 999 456 789',
    role: 'usuario',
    zone: 'Sur',
    status: 'activo',
    alertsReported: 8,
    createdAt: '2024-03-20T16:45:00Z',
    avatar: 'J'
  }
];

// Datos mock de alertas
export const mockAlerts: Alert[] = [
  {
    id: '1',
    title: 'Alerta de Helada Severa',
    description: 'Temperatura inferior a -5°C afectando cultivos de papa y maíz',
    type: 'helada',
    severity: 'crítica',
    status: 'activa',
    priority: 'alta',
    location: 'Distrito de Acobambilla',
    coordinates: [-12.7867, -74.9756] as [number, number],
    reportedBy: 'SENAMHI Huancavelica',
    reportedAt: '2024-12-01T08:30:00Z',
    time: '2024-12-01T08:30:00Z',
    zone: 'Centro'
  },
  {
    id: '2',
    title: 'Granizada Moderada',
    description: 'Precipitación de granizo afectando zonas agrícolas de quinua',
    type: 'granizo',
    severity: 'media',
    status: 'en-proceso',
    priority: 'media',
    location: 'Comunidad de Paucará',
    coordinates: [-12.7756, -74.9656] as [number, number],
    reportedBy: 'Estación Meteorológica Local',
    reportedAt: '2024-12-01T07:15:00Z',
    time: '2024-12-01T07:15:00Z',
    zone: 'Norte',
    responseTime: 15
  },
  {
    id: '3',
    title: 'Sequía en Zona de Pastos',
    description: 'Déficit hídrico prolongado afectando pastizales y ganado',
    type: 'sequía',
    severity: 'baja',
    status: 'en-proceso',
    priority: 'baja',
    location: 'Zona Alto Andina',
    coordinates: [-12.7978, -74.9856] as [number, number],
    reportedBy: 'Oficina Agraria Regional',
    reportedAt: '2024-12-01T06:00:00Z',
    time: '2024-12-01T06:00:00Z',
    zone: 'Sur',
    responseTime: 60
  },
  {
    id: '4',
    title: 'Lluvia Intensa con Riesgo de Inundación',
    description: 'Precipitaciones superiores a 50mm/h en zona urbana y agrícola',
    type: 'lluvia-intensa',
    severity: 'crítica',
    status: 'activa',
    priority: 'alta',
    location: 'Cuenca del Río Ichu',
    coordinates: [-12.7800, -74.9700] as [number, number],
    reportedBy: 'Centro de Operaciones de Emergencia',
    reportedAt: '2024-12-01T05:30:00Z',
    time: '2024-12-01T05:30:00Z',
    zone: 'Centro'
  }
];

// Datos mock de zonas
export const mockZones: Zone[] = [
  {
    id: '1',
    name: 'Zona Centro - Valle',
    coordinates: '12.7867°S, 74.9756°W',
    area: 2.5,
    population: 5420,
    activeAlerts: 8,
    status: 'alta-actividad',
    mapPosition: [-12.7867, -74.9756] as [number, number]
  },
  {
    id: '2',
    name: 'Zona Norte - Puna',
    coordinates: '12.7756°S, 74.9656°W',
    area: 3.2,
    population: 3210,
    activeAlerts: 3,
    status: 'media-actividad',
    mapPosition: [-12.7756, -74.9656] as [number, number]
  },
  {
    id: '3',
    name: 'Zona Sur - Cuenca',
    coordinates: '12.7978°S, 74.9856°W',
    area: 1.8,
    population: 2890,
    activeAlerts: 1,
    status: 'baja-actividad',
    mapPosition: [-12.7978, -74.9856] as [number, number]
  }
];

// Datos mock de notificaciones
export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Alerta de Helada Severa',
    message: 'Se ha emitido alerta de helada para esta noche. Temperatura mínima: -5°C',
    type: 'alerta',
    priority: 'alta',
    read: false,
    createdAt: '2024-12-01T08:30:00Z'
  },
  {
    id: '2',
    title: 'Previsión de Lluvia Intensa',
    message: 'Se esperan precipitaciones de 40-60mm en las próximas 24 horas',
    type: 'alerta',
    priority: 'media',
    read: false,
    createdAt: '2024-12-01T08:00:00Z'
  },
  {
    id: '3',
    title: 'Recomendación Agrícola',
    message: 'Condiciones favorables para siembra de habas en los próximos 3 días',
    type: 'informacion',
    priority: 'baja',
    read: true,
    createdAt: '2024-12-01T07:30:00Z'
  },
  {
    id: '4',
    title: 'Granizada Reportada',
    message: 'Se reporta caída de granizo en zona norte. Verifique sus cultivos',
    type: 'alerta',
    priority: 'alta',
    read: false,
    createdAt: '2024-12-01T07:00:00Z'
  }
];

// Estadísticas del dashboard
export const mockDashboardStats: DashboardStats = {
  activeAlerts: 12,
  resolvedToday: 28,
  inProcess: 7,
  activeUsers: 1234,
  alertsTrend: 3,
  resolvedTrend: 12,
  processTrend: -2,
  usersTrend: 45
};

// Permisos del sistema
export const mockPermissions: Permission[] = [
  { id: 'view_dashboard', name: 'Ver dashboard', description: 'Acceso al panel de monitoreo climático' },
  { id: 'manage_alerts', name: 'Gestionar alertas', description: 'Crear, editar y cerrar alertas meteorológicas' },
  { id: 'view_reports', name: 'Ver reportes', description: 'Acceso a reportes climáticos y estadísticas' },
  { id: 'manage_zones', name: 'Gestionar zonas', description: 'Administrar zonas agrícolas de monitoreo' },
  { id: 'manage_users', name: 'Gestionar usuarios', description: 'Administrar agricultores y autoridades' },
  { id: 'system_config', name: 'Configuración del sistema', description: 'Configuración de umbrales y alertas' },
  { id: 'export_data', name: 'Exportar datos', description: 'Exportar datos meteorológicos' },
  { id: 'view_analytics', name: 'Ver análisis', description: 'Acceso a análisis climáticos y pronósticos' },
  { id: 'receive_notifications', name: 'Recibir notificaciones', description: 'Recibir alertas meteorológicas' },
  { id: 'coordinate_response', name: 'Coordinar respuestas', description: 'Coordinar acciones ante eventos climáticos' },
  { id: 'report_incidents', name: 'Reportar eventos', description: 'Reportar eventos climáticos locales' },
  { id: 'update_profile', name: 'Actualizar perfil', description: 'Modificar información personal y zona' }
];

// Matriz de permisos por rol
export const mockRolePermissions: RolePermissions[] = [
  {
    role: 'administrador',
    permissions: [
      'view_dashboard', 'manage_alerts', 'view_reports', 'manage_zones', 
      'manage_users', 'system_config', 'export_data', 'view_analytics',
      'receive_notifications', 'coordinate_response', 'report_incidents', 'update_profile'
    ]
  },
  {
    role: 'autoridad',
    permissions: [
      'view_dashboard', 'manage_alerts', 'view_reports', 'view_analytics',
      'receive_notifications', 'coordinate_response', 'report_incidents', 'update_profile'
    ]
  },
  {
    role: 'usuario',
    permissions: [
      'view_dashboard', 'receive_notifications', 'report_incidents', 'update_profile'
    ]
  }
];