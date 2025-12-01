import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  Clock,
  Thermometer,
  Droplet,
  Wind,
  AlertTriangle,
  CheckCircle,
  Share2,
  ChevronRight
} from 'lucide-react';
import { Alert } from '../types';
import { alertsApi } from '../services';
import { cn } from '../utils';

interface AlertDetailProps {
  alertId: string | null;
  onClose: () => void;
}

/**
 * Componente de detalle de alerta con información completa y recomendaciones
 */
const AlertDetail: React.FC<AlertDetailProps> = ({ alertId, onClose }) => {
  const [alert, setAlert] = useState<Alert | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (alertId) {
      loadAlertDetail();
    }
  }, [alertId]);

  const loadAlertDetail = async () => {
    if (!alertId) return;
    
    setLoading(true);
    try {
      const [alertData, recs] = await Promise.all([
        alertsApi.getById(alertId),
        alertsApi.getRecommendations(alertId)
      ]);
      
      if (alertData) {
        setAlert(alertData);
        setRecommendations(recs);
      }
    } catch (error) {
      console.error('Error loading alert:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      alta: 'bg-red-50 border-red-400 text-red-700',
      media: 'bg-orange-50 border-orange-400 text-orange-700',
      baja: 'bg-yellow-50 border-yellow-400 text-yellow-700'
    };
    return colors[priority as keyof typeof colors] || colors.baja;
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'alta') return '🔴';
    if (priority === 'media') return '🟠';
    return '🟡';
  };

  const shareOnTelegram = () => {
    if (!alert) return;
    
    const message = `🚨 *${alert.title}*%0A%0A${alert.description}%0A%0A📍 ${alert.location}%0A⏰ ${new Date(alert.reportedAt).toLocaleString('es-PE')}%0A%0A_Reportado por: ${alert.reportedBy}_`;
    const url = `https://t.me/share/url?url=https://alertas-huancavelica.pe/alerta/${alert.id}&text=${message}`;
    window.open(url, '_blank');
  };

  if (!alertId) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Cargando información...</p>
            </div>
          ) : alert ? (
            <>
              {/* Header */}
              <div className={cn(
                "p-6 border-b-4 relative",
                getPriorityColor(alert.priority)
              )}>
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 hover:bg-black/10 rounded-lg transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="pr-12">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getPriorityIcon(alert.priority)}</span>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-sm font-medium uppercase",
                      alert.priority === 'alta' ? 'bg-red-600 text-white' :
                      alert.priority === 'media' ? 'bg-orange-600 text-white' :
                      'bg-yellow-600 text-white'
                    )}>
                      {alert.priority}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {alert.title}
                  </h2>
                  <p className="text-gray-700">
                    {alert.description}
                  </p>
                </div>
              </div>

              {/* Datos meteorológicos */}
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Thermometer className="w-5 h-5 text-blue-600" />
                  Datos meteorológicos
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-xs text-gray-500">Fecha y Hora</p>
                      <p className="font-medium text-sm">
                        {new Date(alert.reportedAt).toLocaleDateString('es-PE', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <Thermometer className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500">Temp. Mínima</p>
                      <p className="font-medium text-sm text-blue-700">
                        {alert.priority === 'alta' ? '-5°C' : alert.priority === 'media' ? '8°C' : '15°C'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-cyan-50 rounded-lg">
                    <Droplet className="w-5 h-5 text-cyan-600" />
                    <div>
                      <p className="text-xs text-gray-500">Precipitación</p>
                      <p className="font-medium text-sm text-cyan-700">
                        {alert.priority === 'alta' ? '80mm' : alert.priority === 'media' ? '45mm' : '15mm'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Wind className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-xs text-gray-500">Viento</p>
                      <p className="font-medium text-sm">
                        {alert.priority === 'alta' ? '45km/h' : alert.priority === 'media' ? '30km/h' : '15km/h'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-900">Zona Afectada</p>
                    <p className="text-sm text-orange-700">{alert.location}</p>
                    <p className="text-xs text-orange-600 mt-1">{alert.zone}</p>
                  </div>
                </div>
              </div>

              {/* Recomendaciones */}
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Recomendaciones y Acciones
                </h3>
                
                <div className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <motion.div
                      key={index}
                      data-testid="recommendation"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <ChevronRight className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-green-900">{rec}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Información Adicional */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Reportado por</p>
                    <p className="font-medium text-gray-900">{alert.reportedBy}</p>
                  </div>
                  {alert.responseTime && (
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Tiempo de respuesta</p>
                      <p className="font-medium text-gray-900">{alert.responseTime} min</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={shareOnTelegram}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  Compartir en Telegram
                </button>
              </div>
            </>
          ) : (
            <div className="p-12 text-center">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No se encontró información de la alerta</p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AlertDetail;
