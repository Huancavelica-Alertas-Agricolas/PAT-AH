// Comentarios añadidos en español: componente `RolePermissions` que gestiona permisos por rol.
// Cómo lo logra: muestra matrices de permisionado y permite asignar permisos a roles predefinidos.
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Check, X, Info } from 'lucide-react';
import { UserRole } from '../types';
import { mockPermissions, mockRolePermissions } from '../data/mockData';

interface RolePermissionsProps {
  userRole: UserRole;
}

const RolePermissions: React.FC<RolePermissionsProps> = ({ userRole }) => {
  const roleDescriptions = {
    administrador: {
      title: 'Administrador',
      description: 'Control total del sistema con acceso completo a todas las funcionalidades',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    autoridad: {
      title: 'Autoridad',
      description: 'Gestión de alertas y coordinación de respuestas a incidentes',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    usuario: {
      title: 'Usuario',
      description: 'Reportar alertas y ver mapa de seguridad de su zona',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    }
  };

  const hasPermission = (role: UserRole, permissionId: string): boolean => {
    const rolePermissions = mockRolePermissions.find(rp => rp.role === role);
    return rolePermissions?.permissions.includes(permissionId) || false;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Roles y Permisos</h1>
          <p className="text-gray-600">Configuración de acceso y permisos del sistema</p>
        </div>
        {userRole === 'administrador' && (
          <button className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors">
            Configurar Roles
          </button>
        )}
      </div>

      {/* Role Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {Object.entries(roleDescriptions).map(([role, config], index) => (
          <motion.div
            key={role}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`bg-white rounded-2xl p-6 shadow-sm border-2 ${
              userRole === role ? 'border-blue-200 bg-blue-50' : 'border-gray-100'
            }`}
          >
            <div className="text-center mb-6">
              <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${config.color} flex items-center justify-center mb-4`}>
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{config.title}</h3>
              <p className="text-sm text-gray-600">{config.description}</p>
              {userRole === role && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  <Check className="w-4 h-4" />
                  Tu rol actual
                </div>
              )}
            </div>

            {/* Permission Count */}
            <div className={`${config.bgColor} rounded-xl p-4 text-center`}>
              <div className={`text-2xl font-bold ${config.textColor}`}>
                {mockRolePermissions.find(rp => rp.role === role)?.permissions.length || 0}
              </div>
              <div className="text-sm text-gray-600">Permisos asignados</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Permissions Matrix */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-white rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Matriz de Permisos</h2>
          <p className="text-gray-600">Detalles de acceso por rol del sistema</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 min-w-[300px]">
                  Permiso
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-900 min-w-[120px]">
                  <div className="flex flex-col items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-600" />
                    Administrador
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-900 min-w-[120px]">
                  <div className="flex flex-col items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    Autoridad
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-900 min-w-[120px]">
                  <div className="flex flex-col items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    Usuario
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockPermissions.map((permission, index) => (
                <motion.tr
                  key={permission.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900 mb-1">
                        {permission.name}
                      </div>
                      <div className="text-sm text-gray-500 flex items-start gap-2">
                        <Info className="w-4 h-4 mt-0.5 text-gray-400" />
                        {permission.description}
                      </div>
                    </div>
                  </td>
                  
                  {/* Administrador */}
                  <td className="px-6 py-4 text-center">
                    {hasPermission('administrador', permission.id) ? (
                      <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                    ) : (
                      <div className="inline-flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                        <X className="w-5 h-5 text-red-600" />
                      </div>
                    )}
                  </td>
                  
                  {/* Autoridad */}
                  <td className="px-6 py-4 text-center">
                    {hasPermission('autoridad', permission.id) ? (
                      <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                    ) : (
                      <div className="inline-flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                        <X className="w-5 h-5 text-red-600" />
                      </div>
                    )}
                  </td>
                  
                  {/* Usuario */}
                  <td className="px-6 py-4 text-center">
                    {hasPermission('usuario', permission.id) ? (
                      <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                    ) : (
                      <div className="inline-flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                        <X className="w-5 h-5 text-red-600" />
                      </div>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Role Guidelines */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-blue-50 rounded-2xl p-6"
      >
        <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
          <Info className="w-5 h-5" />
          Guías de Rol
        </h3>
        <div className="grid md:grid-cols-3 gap-6 text-sm">
          <div>
            <h4 className="font-semibold text-purple-800 mb-2">Administrador</h4>
            <ul className="space-y-1 text-purple-700">
              <li>• Gestión completa del sistema</li>
              <li>• Configuración de roles y permisos</li>
              <li>• Administración de usuarios</li>
              <li>• Acceso a todos los reportes</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">Autoridad</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Gestión y resolución de alertas</li>
              <li>• Coordinación de respuestas</li>
              <li>• Monitoreo de zonas asignadas</li>
              <li>• Generación de reportes</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-green-800 mb-2">Usuario</h4>
            <ul className="space-y-1 text-green-700">
              <li>• Reportar incidentes y alertas</li>
              <li>• Ver mapa de seguridad</li>
              <li>• Recibir notificaciones</li>
              <li>• Actualizar perfil personal</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RolePermissions;