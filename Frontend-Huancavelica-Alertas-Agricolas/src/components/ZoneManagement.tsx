// Comentarios añadidos en español: componente `ZoneManagement` para administrar zonas agrícolas.
// Cómo lo logra: muestra lista de zonas, mapa y controles CRUD para agregar/editar áreas.
import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Plus, Edit, Trash2 } from 'lucide-react';
import { UserRole } from '../types';
import { mockZones } from '../data/mockData';

interface ZoneManagementProps {
  userRole: UserRole;
}

const ZoneManagement: React.FC<ZoneManagementProps> = ({ userRole }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Zonas</h1>
          <p className="text-gray-600">Administra las zonas de monitoreo de Huancavelica</p>
        </div>
        {userRole === 'administrador' && (
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nueva Zona
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Zones List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Zonas Registradas</h2>
          <div className="space-y-4">
            {mockZones.map(zone => (
              <div key={zone.id} className="p-4 border border-gray-200 rounded-xl">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{zone.name}</h3>
                      <p className="text-sm text-gray-600">{zone.coordinates}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>Área: {zone.area} km²</span>
                        <span>Población: {zone.population.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      zone.status === 'alta-actividad' ? 'bg-red-100 text-red-700' :
                      zone.status === 'media-actividad' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {zone.activeAlerts} alertas
                    </span>
                    {userRole === 'administrador' && (
                      <div className="flex gap-1">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-1 hover:bg-red-100 rounded">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Zone Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Vista de Zona</h2>
          <div className="text-center text-gray-500 py-12">
            <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Selecciona una zona para ver detalles</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ZoneManagement;