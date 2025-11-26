
import { useState, useEffect, useMemo } from 'react';
import { Alert, AlertType, SeverityLevel } from '../types';
import axios from 'axios';


export const useAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<{
    type?: AlertType;
    severity?: SeverityLevel;
    showActive?: boolean;
    search?: string;
    sortBy?: 'date' | 'severity';
  }>({});

  useEffect(() => {
    // MOCK: Datos de ejemplo para frontend sin backend
    setIsLoading(true);
    setAlerts([
      {
        id: '1',
        type: 'helada',
        severity: 'alto',
        title: 'Helada intensa',
        description: 'Se espera una helada severa esta noche.',
        recommendations: ['Cubra sus cultivos', 'Riegue temprano'],
        isActive: true,
        createdAt: new Date(),
        validUntil: new Date(Date.now() + 86400000),
        affectedAreas: ['Huancavelica'],
        weatherData: { temperature: -2 }
      },
      {
        id: '2',
        type: 'lluvia_intensa',
        severity: 'medio',
        title: 'Lluvias fuertes',
        description: 'Lluvias intensas durante la tarde.',
        recommendations: ['Revisar drenajes', 'Evitar zonas bajas'],
        isActive: false,
        createdAt: new Date(),
        validUntil: new Date(Date.now() + 172800000),
        affectedAreas: ['Acobamba'],
        weatherData: { rainfall: 30 }
      }
    ]);
    setIsLoading(false);
    // Para conectar con backend, descomenta y elimina el mock:
    // const loadAlerts = async () => {
    //   setIsLoading(true);
    //   try {
    //     const response = await axios.get(`${import.meta.env.VITE_ALERT_API_URL || 'http://localhost:8000/api'}/alerts`);
    //     setAlerts(response.data);
    //   } catch (error) {
    //     setAlerts([]);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };
    // loadAlerts();
  }, []);

  const filteredAlerts = useMemo(() => alerts.filter(alert => {
    if (filters.type && alert.type !== filters.type) return false;
    if (filters.severity && alert.severity !== filters.severity) return false;
    if (filters.showActive !== undefined && alert.isActive !== filters.showActive) return false;
    return true;
  }), [alerts, filters]);

  const activeAlerts = useMemo(() => alerts.filter(alert => alert.isActive), [alerts]);

  const getAlertById = (id: string) => alerts.find(alert => alert.id === id);

  const shareAlert = (alert: Alert) => {
    const message = `🚨 *${alert.title}*\n\n${alert.description}\n\n*Recomendaciones:*\n${alert.recommendations.map(r => `• ${r}`).join('\n')}\n\n_Plataforma de Alertas Climáticas Huancavelica_`;
    
    // Compartir por WhatsApp
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return {
    alerts: filteredAlerts,
    activeAlerts,
    isLoading,
    filters,
    setFilters,
    getAlertById,
    shareAlert
  };
};