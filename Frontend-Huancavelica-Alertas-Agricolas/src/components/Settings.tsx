// Comentarios añadidos en español: componente `Settings` para configuración de la aplicación.
// Cómo lo logra: expone opciones de preferencias, notificaciones, y ajustes de cuenta.

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Palette, 
  Download,
  Eye,
  EyeOff,
  Mail,
  Smartphone,
  MessageSquare,
  Lock
} from 'lucide-react';
import { UserRole } from '../types';

interface SettingsProps {
  userRole: UserRole;
}

const Settings: React.FC<SettingsProps> = ({ userRole }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy' | 'general'>('profile');
  const [showPassword, setShowPassword] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Mi Perfil', icon: User },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'privacy', label: 'Privacidad', icon: Shield },
    { id: 'general', label: 'General', icon: SettingsIcon }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900">Información Personal</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  defaultValue="Usuario Demo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  defaultValue="usuario@alertasegura.pe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  defaultValue="+51 999 123 456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zona Asignada
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Centro</option>
                  <option>Norte</option>
                  <option>Sur</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cambiar Contraseña
              </label>
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Contraseña actual"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <input
                  type="password"
                  placeholder="Nueva contraseña"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="password"
                  placeholder="Confirmar nueva contraseña"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Actualizar Perfil
            </button>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900">Preferencias de Notificación</h3>
            
            <div className="space-y-4">
              {[
                {
                  title: 'Notificaciones por Email',
                  description: 'Recibir alertas y actualizaciones por correo electrónico',
                  icon: Mail,
                  enabled: true
                },
                {
                  title: 'Notificaciones Push',
                  description: 'Alertas instantáneas en el navegador',
                  icon: Bell,
                  enabled: true
                },
                {
                  title: 'Notificaciones SMS',
                  description: 'Mensajes de texto para alertas críticas',
                  icon: Smartphone,
                  enabled: false
                },
                {
                  title: 'Notificaciones de Chat',
                  description: 'Mensajes del equipo de respuesta',
                  icon: MessageSquare,
                  enabled: userRole !== 'usuario'
                }
              ].map((setting, index) => {
                const Icon = setting.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">{setting.title}</div>
                        <div className="text-sm text-gray-600">{setting.description}</div>
                      </div>
                    </div>
                    <button
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        setting.enabled ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-transform ${
                        setting.enabled ? 'left-7' : 'left-1'
                      }`} />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Configuración de Alertas</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  Alertas de alta prioridad
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  Alertas de mi zona
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  Todas las alertas del sistema
                </label>
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900">Privacidad y Seguridad</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Lock className="w-5 h-5 text-gray-600" />
                  <div className="font-medium text-gray-900">Autenticación en Dos Pasos</div>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Agrega una capa extra de seguridad a tu cuenta
                </p>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors">
                  Configurar 2FA
                </button>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Eye className="w-5 h-5 text-gray-600" />
                  <div className="font-medium text-gray-900">Visibilidad del Perfil</div>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="visibility" defaultChecked />
                    Solo autoridades pueden ver mi información
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="visibility" />
                    Todos los usuarios pueden ver mi información básica
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="visibility" />
                    Información completamente privada
                  </label>
                </div>
              </div>

              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h4 className="font-medium text-red-900 mb-2">Zona de Peligro</h4>
                <p className="text-sm text-red-700 mb-3">
                  Estas acciones son irreversibles
                </p>
                <div className="space-y-2">
                  <button className="px-4 py-2 border border-red-300 text-red-700 rounded-lg text-sm hover:bg-red-100 transition-colors">
                    Descargar mis datos
                  </button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors">
                    Eliminar cuenta
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'general':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900">Configuración General</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">Idioma</div>
                    <div className="text-sm text-gray-600">Configura el idioma de la interfaz</div>
                  </div>
                </div>
                <select className="px-3 py-2 border border-gray-300 rounded-lg">
                  <option>Español</option>
                  <option>English</option>
                  <option>Quechua</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Palette className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">Tema</div>
                    <div className="text-sm text-gray-600">Apariencia de la aplicación</div>
                  </div>
                </div>
                <select className="px-3 py-2 border border-gray-300 rounded-lg">
                  <option>Claro</option>
                  <option>Oscuro</option>
                  <option>Automático</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">Exportar Datos</div>
                    <div className="text-sm text-gray-600">Descarga tu información personal</div>
                  </div>
                </div>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Exportar
                </button>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <h4 className="font-medium text-yellow-900 mb-2">Información del Sistema</h4>
              <div className="space-y-1 text-sm text-yellow-800">
                <p><strong>Versión:</strong> AlertaSegura v1.0.0</p>
                <p><strong>Última actualización:</strong> 1 de diciembre, 2024</p>
                <p><strong>Soporte:</strong> soporte@alertasegura.pe</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-600">Personaliza tu experiencia con AlertaSegura</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm lg:col-span-1"
        >
          <nav className="space-y-2">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </motion.button>
              );
            })}
          </nav>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm lg:col-span-3"
        >
          {renderTabContent()}
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;