import { apolloClient } from '../lib/apollo-client';
import { Alert, Notification, Zone, User } from '../types';
import { mockAlerts, mockNotifications, mockZones, mockUsers } from '../data/mockData';
import {
  GET_ALERTS,
  GET_ALERT_BY_ID,
  GET_ALERT_RECOMMENDATIONS,
  GET_NOTIFICATIONS,
  GET_UNREAD_COUNT,
  GET_ZONES,
  GET_USERS,
  GET_REPORT_DATA,
} from '../graphql/queries';
import {
  LOGIN,
  RECOVER_PASSWORD,
  VERIFY_CODE,
  RESET_PASSWORD,
  MARK_NOTIFICATION_READ,
  GENERATE_REPORT,
} from '../graphql/mutations';

// Flag para activar/desactivar mocks - cambiar a false cuando el backend esté listo
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || true;

// Función helper para simular delay de red
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper para recomendaciones por tipo
function getRecommendationsByType(type: string) {
  const recommendations: Record<string, Array<{ id: string; title: string; description: string; priority: string }>> = {
    helada: [
      { id: '1', title: 'Proteger cultivos', description: 'Cubrir plantas sensibles con mantas térmicas o plástico durante la noche', priority: 'alta' },
      { id: '2', title: 'Riego preventivo', description: 'Regar antes del atardecer para aprovechar el calor latente del agua', priority: 'alta' },
      { id: '3', title: 'Uso de combustión', description: 'Quemar materiales para generar humo y calor en el cultivo', priority: 'media' },
      { id: '4', title: 'Cosecha anticipada', description: 'Cosechar productos maduros antes de la helada', priority: 'alta' },
    ],
    granizada: [
      { id: '1', title: 'Mallas antigranizo', description: 'Instalar sistemas de protección con mallas sobre los cultivos', priority: 'alta' },
      { id: '2', title: 'Cañones antigranizo', description: 'Activar sistemas de dispersión de nubes si están disponibles', priority: 'media' },
      { id: '3', title: 'Refugio de animales', description: 'Proteger al ganado en establos cubiertos', priority: 'alta' },
      { id: '4', title: 'Evaluación post-evento', description: 'Inspeccionar daños y aplicar tratamientos preventivos contra plagas', priority: 'media' },
    ],
    lluvia: [
      { id: '1', title: 'Drenaje', description: 'Verificar y limpiar sistemas de drenaje para evitar inundaciones', priority: 'alta' },
      { id: '2', title: 'Protección de semillas', description: 'Evitar siembra durante lluvias intensas', priority: 'media' },
      { id: '3', title: 'Control de erosión', description: 'Implementar barreras vegetales o físicas en terrenos con pendiente', priority: 'alta' },
      { id: '4', title: 'Almacenamiento seguro', description: 'Proteger cosechas almacenadas de la humedad', priority: 'media' },
    ],
    sequia: [
      { id: '1', title: 'Riego eficiente', description: 'Implementar sistemas de riego por goteo o aspersión', priority: 'alta' },
      { id: '2', title: 'Mulching', description: 'Aplicar cobertura orgánica para retener humedad del suelo', priority: 'media' },
      { id: '3', title: 'Cultivos resistentes', description: 'Sembrar variedades adaptadas a condiciones de sequía', priority: 'alta' },
      { id: '4', title: 'Conservación de agua', description: 'Almacenar agua de lluvia en reservorios', priority: 'alta' },
    ],
    viento: [
      { id: '1', title: 'Cortinas rompevientos', description: 'Plantar árboles o instalar barreras para reducir velocidad del viento', priority: 'media' },
      { id: '2', title: 'Reforzar estructuras', description: 'Asegurar invernaderos y estructuras agrícolas', priority: 'alta' },
      { id: '3', title: 'Tutorado de plantas', description: 'Atar y reforzar plantas altas susceptibles a volcarse', priority: 'media' },
      { id: '4', title: 'Riego post-viento', description: 'Reponer humedad perdida por evapotranspiración acelerada', priority: 'baja' },
    ],
  };
  return recommendations[type] || [];
}

// ==================== ALERTS API ====================
export const alertsApi = {
  async getAll(): Promise<Alert[]> {
    if (USE_MOCK) {
      await delay(500);
      return mockAlerts;
    }
    
    const { data } = await apolloClient.query({
      query: GET_ALERTS,
    });
    return (data as any).alerts;
  },

  async getById(id: string): Promise<Alert | undefined> {
    if (USE_MOCK) {
      await delay(300);
      return mockAlerts.find(alert => alert.id === id);
    }
    
    const { data } = await apolloClient.query({
      query: GET_ALERT_BY_ID,
      variables: { id },
    });
    return (data as any).alert;
  },

  async filter(filters: {
    type?: string[];
    severity?: string[];
    zone?: string[];
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Alert[]> {
    if (USE_MOCK) {
      await delay(400);
      let filtered = [...mockAlerts];

      if (filters.type?.length) {
        filtered = filtered.filter(alert => filters.type!.includes(alert.type));
      }
      if (filters.severity?.length) {
        filtered = filtered.filter(alert => filters.severity!.includes(alert.severity));
      }
      if (filters.zone?.length) {
        filtered = filtered.filter(alert => filters.zone!.includes(alert.zone));
      }
      if (filters.dateFrom) {
        filtered = filtered.filter(alert => new Date(alert.time) >= new Date(filters.dateFrom!));
      }
      if (filters.dateTo) {
        filtered = filtered.filter(alert => new Date(alert.time) <= new Date(filters.dateTo!));
      }

      return filtered;
    }
    
    const { data } = await apolloClient.query({
      query: GET_ALERTS,
      variables: { filter: filters },
    });
    return (data as any).alerts;
  },

  async getRecommendations(alertId: string) {
    if (USE_MOCK) {
      await delay(200);
      const alert = mockAlerts.find(a => a.id === alertId);
      if (!alert) return [];
      return getRecommendationsByType(alert.type);
    }
    
    const { data } = await apolloClient.query({
      query: GET_ALERT_RECOMMENDATIONS,
      variables: { type: alertId },
    });
    return (data as any).alertRecommendations;
  },
};

// ==================== NOTIFICATIONS API ====================
export const notificationsApi = {
  async getAll(userId: string): Promise<Notification[]> {
    if (USE_MOCK) {
      await delay(400);
      return mockNotifications;
    }
    
    const { data } = await apolloClient.query({
      query: GET_NOTIFICATIONS,
      variables: { userId },
    });
    return (data as any).notifications;
  },

  async markAsRead(notificationId: string): Promise<void> {
    if (USE_MOCK) {
      await delay(200);
      return;
    }
    
    await apolloClient.mutate({
      mutation: MARK_NOTIFICATION_READ,
      variables: { id: notificationId },
    });
  },

  async getUnreadCount(userId: string): Promise<number> {
    if (USE_MOCK) {
      await delay(150);
      return mockNotifications.filter(n => !n.read).length;
    }
    
    const { data } = await apolloClient.query({
      query: GET_UNREAD_COUNT,
      variables: { userId },
    });
    return (data as any).unreadNotificationsCount;
  },
};

// ==================== ZONES API ====================
export const zonesApi = {
  async getAll(): Promise<Zone[]> {
    if (USE_MOCK) {
      await delay(300);
      return mockZones;
    }
    
    const { data } = await apolloClient.query({
      query: GET_ZONES,
    });
    return (data as any).zones;
  },
};

// ==================== USERS API ====================
export const usersApi = {
  async getAll(): Promise<User[]> {
    if (USE_MOCK) {
      await delay(400);
      return mockUsers;
    }
    
    const { data } = await apolloClient.query({
      query: GET_USERS,
    });
    return (data as any).users;
  },
};

// ==================== AUTH API ====================
export const authApi = {
  async login(phone: string, password: string): Promise<User> {
    if (USE_MOCK) {
      await delay(800);
      if (phone === '+51999999999' && password === 'password123') {
        return mockUsers[0];
      }
      throw new Error('Credenciales inválidas');
    }
    
    const { data } = await apolloClient.mutate({
      mutation: LOGIN,
      variables: { phone, password },
    });
    
    if ((data as any).login.token) {
      localStorage.setItem('auth_token', (data as any).login.token);
    }
    
    return (data as any).login.user;
  },

  async recoverPassword(identifier: string, method: 'sms' | 'email'): Promise<void> {
    if (USE_MOCK) {
      await delay(1000);
      console.log(`Código enviado a ${identifier} vía ${method}`);
      return;
    }
    
    await apolloClient.mutate({
      mutation: RECOVER_PASSWORD,
      variables: { identifier, method },
    });
  },

  async verifyCode(identifier: string, code: string): Promise<boolean> {
    if (USE_MOCK) {
      await delay(600);
      return code === '123456';
    }
    
    const { data } = await apolloClient.mutate({
      mutation: VERIFY_CODE,
      variables: { phone: identifier, code },
    });
    
    return (data as any).verifyCode.success;
  },

  async resetPassword(identifier: string, code: string, newPassword: string): Promise<void> {
    if (USE_MOCK) {
      await delay(800);
      console.log(`Contraseña actualizada para ${identifier}`);
      return;
    }
    
    await apolloClient.mutate({
      mutation: RESET_PASSWORD,
      variables: { token: code, newPassword },
    });
  },
};

// ==================== REPORTS API ====================
export const reportsApi = {
  async generate(crop: string, dateFrom: string, dateTo: string) {
    if (USE_MOCK) {
      await delay(600);
      const data = [];
      const start = new Date(dateFrom);
      const end = new Date(dateTo);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        data.push({
          date: d.toISOString().split('T')[0],
          temperatura: Math.random() * 15 + 10,
          precipitacion: Math.random() * 50,
          humedad: Math.random() * 30 + 60,
          alertas: Math.floor(Math.random() * 3),
        });
      }
      
      return data;
    }
    
    const { data } = await apolloClient.query({
      query: GET_REPORT_DATA,
      variables: { crop, dateFrom, dateTo },
    });
    return (data as any).reportData;
  },

  async exportPDF(crop: string, data: any[]): Promise<Blob> {
    if (USE_MOCK) {
      await delay(1000);
      return new Blob(['PDF Content'], { type: 'application/pdf' });
    }
    
    const { data: mutationData } = await apolloClient.mutate({
      mutation: GENERATE_REPORT,
      variables: { crop, dateFrom: data[0].date, dateTo: data[data.length - 1].date },
    });
    
    const response = await fetch((mutationData as any).generateReport.url);
    return response.blob();
  },
};
