// Comentarios añadidos en español: componente `AlertsList` que muestra la lista de alertas.
// Cómo lo logra: recibe props con alertas y renderiza filas filtrables y paginables.
// Comentarios añadidos en español: componente `AlertsList` que muestra la lista de alertas.
// Cómo lo logra: recibe props con alertas y renderiza filas filtrables y paginables.
import React from 'react';
import { motion } from 'framer-motion';
import { Filter, Plus, MoreVertical } from 'lucide-react';
import { UserRole } from '../types';
import { mockAlerts } from '../data/mockData';

interface AlertsListProps {
  userRole: UserRole;
  onAlertClick?: (alertId: string) => void;
}

const AlertsList: React.FC<AlertsListProps> = ({ userRole, onAlertClick }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Alertas</h1>
          <p className="text-gray-600">Administra todas las alertas del sistema</p>
        </div>
        {(userRole === 'administrador' || userRole === 'autoridad') && (
          <button className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nueva Alerta
          </button>
        )}
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-sm"
      >
        <div className="flex items-center gap-4 mb-6">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Filtrar
          </button>
        </div>
        
        <div className="space-y-4">
          {mockAlerts.map(alert => (
            <div 
              key={alert.id} 
              data-testid="alert-card" 
              onClick={() => onAlertClick?.(alert.id)}
              className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                  <p className="text-gray-600 mt-1">{alert.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>{alert.location}</span>
                    <span>{alert.zone}</span>
                    <span>{new Date(alert.reportedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    alert.priority === 'alta' ? 'bg-red-100 text-red-700' :
                    alert.priority === 'media' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {alert.priority}
                  </span>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AlertsList;