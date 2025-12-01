// Comentarios añadidos en español: componente `DashboardView` que muestra resumen y widgets.
// Cómo lo logra: combina métricas, lista de alertas recientes y gráficos en una vista compacta.
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle,
  MapPin,
  Droplet,
  Thermometer,
  Wind,
  Bell,
  Phone,
  Mail,
  Map as MapIcon,
  Clock
} from 'lucide-react';
import { UserRole } from '../types';
import { BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { cn } from '../utils';

interface DashboardViewProps {
  userRole: UserRole;
  onAlertClick?: (alertId: string) => void;
}

// Datos de pronóstico de precipitación
const precipitationData = [
  { date: '01 Dic', real: 45, forecast: 42 },
  { date: '02 Dic', real: 52, forecast: 50 },
  { date: '03 Dic', real: 38, forecast: 35 },
  { date: '04 Dic', real: 68, forecast: 65 },
  { date: '05 Dic', real: 78, forecast: 75 },
  { date: '06 Dic', real: 85, forecast: 82 },
  { date: '07 Dic', real: 65, forecast: 62 },
];

const DashboardView: React.FC<DashboardViewProps> = ({ userRole: _userRole, onAlertClick: _onAlertClick }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState({
    general: true,
    email: true,
    sms: false
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4 md:p-6">
      {/* Alerta de Emergencia */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border-2 border-red-400 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6"
      >
        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
          <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 flex-shrink-0" />
          <div className="flex-1 w-full">
            <h3 className="text-lg sm:text-xl font-bold text-red-900 mb-2">¡ALERTA DE EMERGENCIA!</h3>
            <p className="text-sm sm:text-base text-red-800 mb-3 sm:mb-4">
              Se esperan precipitaciones superiores a 80mm en las próximas 6 horas. Riesgo alto de inundaciones en zonas bajas.
            </p>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-600 text-white rounded-lg text-sm sm:text-base font-medium hover:bg-red-700 transition-colors">
                Precipitación 88mm
              </button>
              <button className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-600 text-white rounded-lg text-sm sm:text-base font-medium hover:bg-red-700 transition-colors">
                Vientos 48 km/h
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Contenido Principal */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Monitoreo en Tiempo Real */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="relative h-48 sm:h-56 md:h-64 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1527482937786-6608eea82cba?w=800)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
            <div className="relative h-full flex flex-col justify-end p-4 sm:p-6 text-white">
              <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Monitoreo en Tiempo Real</h3>
              <p className="text-base sm:text-lg">Tu zona: Norte</p>
            </div>
          </motion.div>

          {/* Alertas en Mi Zona */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Alertas en Mi Zona</h2>
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium self-start sm:self-auto">
                1 Activada
              </span>
            </div>

            {/* Alerta Roja */}
            <div 
              data-testid="alert-card"
              onClick={() => _onAlertClick?.('1')}
              className="border-2 border-red-400 rounded-xl p-4 sm:p-6 bg-red-50 relative cursor-pointer hover:bg-red-100 transition-colors">
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full"></div>
              <div className="flex flex-col gap-3 mb-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Alerta Roja - Lluvias Intensas</h3>
                  <span className="inline-block px-3 py-1 bg-red-600 text-white rounded-lg text-sm font-medium">
                    Emergencia
                  </span>
                </div>
              </div>
              
              <p className="text-sm sm:text-base text-gray-700 mb-4">
                Se esperan precipitaciones superiores a 80mm en las próximas 6 horas. Riesgo alto de inundaciones en zonas bajas.
              </p>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-center gap-2 text-sm sm:text-base text-gray-600">
                  <Droplet className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                  <span>85mm</span>
                </div>
                <div className="flex items-center gap-2 text-sm sm:text-base text-gray-600">
                  <Wind className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                  <span>45 km/h</span>
                </div>
                <div className="flex items-center gap-2 text-sm sm:text-base text-gray-600">
                  <Thermometer className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0" />
                  <span>14°C</span>
                </div>
                <div className="flex items-center gap-2 text-sm sm:text-base text-gray-600">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
                  <span>1 zona(s)</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 text-xs sm:text-sm text-gray-500">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>30 nov 2025, 21:25</span>
              </div>
            </div>
          </motion.div>

          {/* Pronóstico de Precipitación */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Pronóstico de Precipitación - 7 Días</h2>
            <div className="w-full overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="min-w-[500px] sm:min-w-0">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={precipitationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="real" fill="#3b82f6" name="Precipitación Real" radius={[8, 8, 0, 0]} />
                    <Line type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={2} name="Pronóstico" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

          {/* Alertas en Otras Zonas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Alertas en Otras Zonas</h2>
            
            <div className="space-y-3 sm:space-y-4">
              {/* Alerta Naranja */}
              <div className="border-2 border-orange-400 rounded-xl p-4 sm:p-6 bg-orange-50 relative">
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-3 h-3 sm:w-4 sm:h-4 bg-orange-500 rounded-full"></div>
                <div className="mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Alerta Naranja - Precaución</h3>
                  <span className="inline-block px-3 py-1 bg-orange-500 text-white rounded-lg text-sm font-medium">
                    Alerta
                  </span>
                </div>
                
                <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">
                  Precipitaciones moderadas a fuertes esperadas. Se recomienda evitar desplazamientos innecesarios.
                </p>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 text-sm sm:text-base text-gray-600">
                    <Droplet className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                    <span>55mm</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm sm:text-base text-gray-600">
                    <Wind className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                    <span>30 km/h</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm sm:text-base text-gray-600">
                    <Thermometer className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0" />
                    <span>20°C</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm sm:text-base text-gray-600">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0" />
                    <span>2 zona(s)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>30 nov 2025, 19:25</span>
                </div>
              </div>

              {/* Alerta Amarilla */}
              <div className="border-2 border-yellow-400 rounded-xl p-4 sm:p-6 bg-yellow-50 relative">
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-3 h-3 sm:w-4 sm:h-4 bg-yellow-500 rounded-full"></div>
                <div className="mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Alerta Amarilla - Vigilancia</h3>
                  <span className="inline-block px-3 py-1 bg-yellow-500 text-white rounded-lg text-sm font-medium">
                    Precaución
                  </span>
                </div>
                
                <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">
                  Condiciones meteorológicas susceptibles de provocar lluvias moderadas.
                </p>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 text-sm sm:text-base text-gray-600">
                    <Droplet className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                    <span>25mm</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm sm:text-base text-gray-600">
                    <Wind className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                    <span>20 km/h</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm sm:text-base text-gray-600">
                    <Thermometer className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0" />
                    <span>22°C</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm sm:text-base text-gray-600">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
                    <span>1 zona(s)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>30 nov 2025, 17:25</span>
                </div>
              </div>

              {/* Sistema Normalizado */}
              <div className="border-2 border-green-400 rounded-xl p-4 sm:p-6 bg-green-50 relative">
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full"></div>
                <div className="mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Sistema Normalizado</h3>
                  <span className="inline-block px-3 py-1 bg-green-500 text-white rounded-lg text-sm font-medium">
                    Normal
                  </span>
                </div>
                
                <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">
                  Condiciones meteorológicas favorables. Sin riesgo de precipitaciones significativas.
                </p>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 text-sm sm:text-base text-gray-600">
                    <Droplet className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                    <span>5mm</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm sm:text-base text-gray-600">
                    <Wind className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                    <span>10 km/h</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm sm:text-base text-gray-600">
                    <Thermometer className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0" />
                    <span>24°C</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm sm:text-base text-gray-600">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                    <span>1 zona(s)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>29 nov 2025, 23:25</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar Derecho */}
        <div className="space-y-4 sm:space-y-6">
          {/* Estado de Mi Zona */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6"
          >
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Estado de Mi Zona</h3>
            
            <div className="border-2 border-red-400 rounded-xl p-3 sm:p-4 bg-red-50 relative">
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0" />
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-gray-900">Zona Norte</h4>
                  <p className="text-xs sm:text-sm text-gray-600">Norte</p>
                </div>
              </div>
              <span className="inline-block px-2.5 py-1 sm:px-3 sm:py-1 bg-red-600 text-white rounded-lg text-xs sm:text-sm font-medium">
                Emergencia
              </span>
            </div>
          </motion.div>

          {/* Notificaciones */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6"
          >
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 flex-shrink-0" />
              <h3 className="text-base sm:text-lg font-bold text-gray-900">Notificaciones</h3>
            </div>
            
            <div className="space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm sm:text-base text-gray-700">Activar Notificaciones</span>
                <button
                  onClick={() => setNotificationsEnabled(prev => ({ ...prev, general: !prev.general }))}
                  className={cn(
                    "relative w-11 h-6 sm:w-12 sm:h-6 rounded-full transition-colors flex-shrink-0",
                    notificationsEnabled.general ? "bg-gray-900" : "bg-gray-300"
                  )}
                >
                  <div className={cn(
                    "absolute w-4 h-4 bg-white rounded-full top-1 transition-transform",
                    notificationsEnabled.general ? "left-6 sm:left-7" : "left-1"
                  )} />
                </button>
              </div>
              
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm sm:text-base text-gray-700">Notificaciones por Email</span>
                <button
                  onClick={() => setNotificationsEnabled(prev => ({ ...prev, email: !prev.email }))}
                  className={cn(
                    "relative w-11 h-6 sm:w-12 sm:h-6 rounded-full transition-colors flex-shrink-0",
                    notificationsEnabled.email ? "bg-gray-900" : "bg-gray-300"
                  )}
                >
                  <div className={cn(
                    "absolute w-4 h-4 bg-white rounded-full top-1 transition-transform",
                    notificationsEnabled.email ? "left-6 sm:left-7" : "left-1"
                  )} />
                </button>
              </div>
              
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm sm:text-base text-gray-700">Notificaciones por SMS</span>
                <button
                  onClick={() => setNotificationsEnabled(prev => ({ ...prev, sms: !prev.sms }))}
                  className={cn(
                    "relative w-11 h-6 sm:w-12 sm:h-6 rounded-full transition-colors flex-shrink-0",
                    notificationsEnabled.sms ? "bg-gray-900" : "bg-gray-300"
                  )}
                >
                  <div className={cn(
                    "absolute w-4 h-4 bg-white rounded-full top-1 transition-transform",
                    notificationsEnabled.sms ? "left-6 sm:left-7" : "left-1"
                  )} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Contacto de Emergencia */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6"
          >
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Contacto de Emergencia</h3>
            
            <div className="space-y-2.5 sm:space-y-3">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Línea de Emergencias</p>
                <div className="flex items-center gap-1.5 sm:gap-2 text-red-600 font-bold text-sm sm:text-base">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>123</span>
                </div>
              </div>
              
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Protección Civil</p>
                <div className="flex items-center gap-1.5 sm:gap-2 text-gray-900 text-sm sm:text-base">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">+1 800 123 4567</span>
                </div>
              </div>
              
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Correo de Soporte</p>
                <div className="flex items-center gap-1.5 sm:gap-2 text-blue-600 text-xs sm:text-sm">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">soporte@alertasvivas.com</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Mapa de Zonas de Riesgo */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6"
          >
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Mapa de Zonas de Riesgo</h3>
            
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
              {/* Zona Norte */}
              <div className="border-2 border-red-400 rounded-lg p-2 sm:p-3 bg-red-50 text-center">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mx-auto mb-1 sm:mb-2" />
                <p className="font-medium text-gray-900 text-xs sm:text-sm mb-0.5 sm:mb-1">Zona Norte</p>
                <p className="text-[10px] sm:text-xs text-gray-600">Norte</p>
              </div>

              {/* Zona Sur */}
              <div className="border-2 border-orange-400 rounded-lg p-2 sm:p-3 bg-orange-50 text-center">
                <MapIcon className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 mx-auto mb-1 sm:mb-2" />
                <p className="font-medium text-gray-900 text-xs sm:text-sm mb-0.5 sm:mb-1">Zona Sur</p>
                <p className="text-[10px] sm:text-xs text-gray-600">Sur</p>
              </div>

              {/* Centro */}
              <div className="border-2 border-green-400 rounded-lg p-2 sm:p-3 bg-green-50 text-center">
                <MapIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mx-auto mb-1 sm:mb-2" />
                <p className="font-medium text-gray-900 text-xs sm:text-sm mb-0.5 sm:mb-1">Centro</p>
                <p className="text-[10px] sm:text-xs text-gray-600">Centro</p>
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full flex-shrink-0"></div>
                <span className="text-gray-700">Emergencia</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-orange-500 rounded-full flex-shrink-0"></div>
                <span className="text-gray-700">Alerta</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-yellow-500 rounded-full flex-shrink-0"></div>
                <span className="text-gray-700">Precaución</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                <span className="text-gray-700">Normal</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;