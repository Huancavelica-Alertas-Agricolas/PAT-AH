import React, { useState, useEffect } from 'react';
// Comentarios añadidos en español: componente `NotificationCenter` que muestra notificaciones locales.
// Cómo lo logra: lista notificaciones, permite marcar leídas y navegar a alertas relacionadas.
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Bell, 
  Settings, 
  Volume2, 
  VolumeX, 
  Check, 
  Trash2, 
  Filter,
  AlertTriangle,
  CheckCircle,
  Info,
  AlertCircle,
} from 'lucide-react';
import { UserRole, Notification } from '../types';

interface NotificationCenterProps {
  userRole: UserRole;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ userRole: _userRole }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'alerta' | 'exito' | 'advertencia' | 'informacion'>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  // Simular notificaciones en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% probabilidad cada 30 segundos
        const alertTypes = [
          'Alerta de Helada',
          'Riesgo de Granizada',
          'Lluvia Intensa',
          'Sequía Detectada',
          'Vientos Fuertes'
        ];
        const zones = ['Zona Centro - Valle', 'Zona Norte - Puna', 'Zona Sur - Cuenca'];
        
        const newNotification: Notification = {
          id: Date.now().toString(),
          title: alertTypes[Math.floor(Math.random() * alertTypes.length)],
          message: `${alertTypes[Math.floor(Math.random() * alertTypes.length)]} detectada en ${zones[Math.floor(Math.random() * zones.length)]}`,
          type: Math.random() > 0.6 ? 'alerta' : Math.random() > 0.5 ? 'advertencia' : 'informacion',
          priority: Math.random() > 0.7 ? 'alta' : Math.random() > 0.5 ? 'media' : 'baja',
          read: false,
          createdAt: new Date().toISOString()
        };

        setNotifications(prev => [newNotification, ...prev.slice(0, 19)]);
        
        // Mostrar toast
        if (soundEnabled) {
          toast[newNotification.type === 'alerta' ? 'error' : newNotification.type === 'exito' ? 'success' : newNotification.type === 'advertencia' ? 'warning' : 'info'](
            newNotification.title,
            {
              description: newNotification.message,
              duration: 5000,
            }
          );
        }
      }
    }, 30000); // Cada 30 segundos

    return () => clearInterval(interval);
  }, [soundEnabled]);

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filter);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    const icons = {
      alerta: AlertTriangle,
      exito: CheckCircle,
      advertencia: AlertCircle,
      informacion: Info
    };
    return icons[type as keyof typeof icons] || Info;
  };

  const getNotificationColor = (type: string) => {
    const colors = {
      alerta: 'text-red-600 bg-red-100',
      exito: 'text-green-600 bg-green-100',
      advertencia: 'text-yellow-600 bg-yellow-100',
      informacion: 'text-blue-600 bg-blue-100'
    };
    return colors[type as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Centro de Notificaciones</h1>
            <p className="text-gray-600">Gestiona tus alertas y notificaciones del sistema</p>
          </div>
          {unreadCount > 0 && (
            <div className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
              {unreadCount} sin leer
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Marcar como leídas
            </button>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-sm"
      >
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Configuración de Notificaciones
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Notificaciones Push</h3>
                <p className="text-sm text-gray-600">Recibir alertas en tiempo real</p>
              </div>
              <button
                onClick={() => setPushEnabled(!pushEnabled)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  pushEnabled ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-transform ${
                  pushEnabled ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Sonido de Alerta</h3>
                <p className="text-sm text-gray-600">Reproducir sonido para nuevas alertas</p>
              </div>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-lg transition-colors ${
                  soundEnabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 mb-3">Estadísticas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{notifications.length}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{unreadCount}</div>
                <div className="text-sm text-gray-600">Sin leer</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-6 shadow-sm"
      >
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">Filtrar por tipo:</span>
          {[
            { key: 'all', label: 'Todas', count: notifications.length },
            { key: 'alerta', label: 'Alertas', count: notifications.filter(n => n.type === 'alerta').length },
            { key: 'exito', label: 'Éxito', count: notifications.filter(n => n.type === 'exito').length },
            { key: 'advertencia', label: 'Advertencia', count: notifications.filter(n => n.type === 'advertencia').length },
            { key: 'informacion', label: 'Información', count: notifications.filter(n => n.type === 'informacion').length }
          ].map(filterOption => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key as any)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                filter === filterOption.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filterOption.label}
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                filter === filterOption.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {filterOption.count}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Notifications List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            Notificaciones ({filteredNotifications.length})
          </h2>
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
            >
              Limpiar todo
            </button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay notificaciones</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification, index) => {
                const Icon = getNotificationIcon(notification.type);
                const colorClass = getNotificationColor(notification.type);
                
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${colorClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-xs text-gray-500">
                                {new Date(notification.createdAt).toLocaleDateString('es-PE', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                                notification.priority === 'alta' ? 'bg-red-100 text-red-700' :
                                notification.priority === 'media' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {notification.priority}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-1 hover:bg-blue-100 rounded transition-colors"
                                title="Marcar como leída"
                              >
                                <Check className="w-4 h-4 text-blue-600" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="p-1 hover:bg-red-100 rounded transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default NotificationCenter;