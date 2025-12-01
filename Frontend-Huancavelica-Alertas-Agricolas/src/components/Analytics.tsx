import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Clock, MapPin, AlertTriangle } from 'lucide-react';
import { UserRole } from '../types';

interface AnalyticsProps {
  userRole: UserRole;
}

// Datos mock para gráficos
const weeklyData = [
  { day: 'Lun', alertas: 12, resueltas: 8 },
  { day: 'Mar', alertas: 15, resueltas: 12 },
  { day: 'Mié', alertas: 8, resueltas: 10 },
  { day: 'Jue', alertas: 18, resueltas: 15 },
  { day: 'Vie', alertas: 22, resueltas: 18 },
  { day: 'Sáb', alertas: 25, resueltas: 20 },
  { day: 'Dom', alertas: 14, resueltas: 16 }
];

const monthlyTrend = [
  { mes: 'Ene', alertas: 145 },
  { mes: 'Feb', alertas: 132 },
  { mes: 'Mar', alertas: 178 },
  { mes: 'Abr', alertas: 156 },
  { mes: 'May', alertas: 189 },
  { mes: 'Jun', alertas: 167 }
];

const priorityData = [
  { name: 'Alta', value: 35, color: '#ef4444' },
  { name: 'Media', value: 45, color: '#f59e0b' },
  { name: 'Baja', value: 20, color: '#3b82f6' }
];

const zoneData = [
  { zona: 'Centro', alertas: 45 },
  { zona: 'Norte', alertas: 32 },
  { zona: 'Sur', alertas: 28 }
];

const Analytics: React.FC<AnalyticsProps> = ({ userRole: _userRole }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Análisis y Estadísticas</h1>
          <p className="text-gray-600">Insights y tendencias del sistema AlertaSegura</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
          Exportar Reporte
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            title: 'Tiempo Promedio de Respuesta',
            value: '8.5 min',
            change: '-12%',
            positive: true,
            icon: Clock,
            color: 'from-blue-500 to-blue-600'
          },
          {
            title: 'Zona Más Crítica',
            value: 'Centro',
            change: '45 alertas',
            positive: false,
            icon: MapPin,
            color: 'from-red-500 to-red-600'
          },
          {
            title: 'Horario Pico',
            value: '18:00-22:00',
            change: '65%',
            positive: false,
            icon: AlertTriangle,
            color: 'from-yellow-500 to-yellow-600'
          },
          {
            title: 'Tasa de Resolución',
            value: '94.2%',
            change: '+5.8%',
            positive: true,
            icon: TrendingUp,
            color: 'from-green-500 to-green-600'
          }
        ].map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className="w-8 h-8 text-gray-600" />
                <span className={`text-sm font-medium ${
                  metric.positive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</h3>
              <p className="text-sm text-gray-600">{metric.title}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Alerts vs Resolved */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6">Alertas Semanales</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="alertas" fill="#ef4444" name="Alertas" radius={4} />
                <Bar dataKey="resueltas" fill="#10b981" name="Resueltas" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Monthly Trend */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6">Tendencia Mensual</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="alertas" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Priority Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6">Distribución por Prioridad</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Alerts by Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6">Alertas por Zona</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="zona" type="category" width={60} />
                <Tooltip />
                <Bar dataKey="alertas" fill="#8b5cf6" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;