import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { FileText, Download, Calendar, Sprout, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';
import Tooltip from './Tooltip';
import { reportsApi } from '../services';
import { toast } from 'sonner';

interface ReportData {
  date: string;
  temperatura: number;
  precipitacion: number;
  humedad: number;
  alertas: number;
}

const crops = [
  { id: 'papa', name: 'Papa', icon: '🥔' },
  { id: 'maiz', name: 'Maíz', icon: '🌽' },
  { id: 'quinua', name: 'Quinua', icon: '🌾' },
  { id: 'habas', name: 'Habas', icon: '🫘' },
  { id: 'trigo', name: 'Trigo', icon: '🌾' },
];

const periods = [
  { id: '7d', name: 'Últimos 7 días' },
  { id: '30d', name: 'Últimos 30 días' },
  { id: '90d', name: 'Últimos 3 meses' },
  { id: 'custom', name: 'Período personalizado' },
];

export default function Reports() {
  const [selectedCrop, setSelectedCrop] = useState('papa');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    avgTemp: 0,
    totalPrecip: 0,
    avgHumidity: 0,
    totalAlerts: 0,
    tempTrend: 0,
    precipTrend: 0,
  });

  useEffect(() => {
    loadReportData();
  }, [selectedCrop, selectedPeriod, customDateFrom, customDateTo]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      let dateFrom = '';
      let dateTo = new Date().toISOString().split('T')[0];

      if (selectedPeriod === 'custom') {
        dateFrom = customDateFrom;
        dateTo = customDateTo;
      } else {
        const days = parseInt(selectedPeriod);
        const date = new Date();
        date.setDate(date.getDate() - days);
        dateFrom = date.toISOString().split('T')[0];
      }

      const data = await reportsApi.generate(selectedCrop, dateFrom, dateTo);
      setReportData(data);

      // Calcular estadísticas
      const avgTemp = data.reduce((sum: number, d: any) => sum + d.temperatura, 0) / data.length;
      const totalPrecip = data.reduce((sum: number, d: any) => sum + d.precipitacion, 0);
      const avgHumidity = data.reduce((sum: number, d: any) => sum + d.humedad, 0) / data.length;
      const totalAlerts = data.reduce((sum: number, d: any) => sum + d.alertas, 0);

      // Calcular tendencias (comparar primera mitad vs segunda mitad)
      const midPoint = Math.floor(data.length / 2);
      const firstHalfTemp = data.slice(0, midPoint).reduce((sum: number, d: any) => sum + d.temperatura, 0) / midPoint;
      const secondHalfTemp = data.slice(midPoint).reduce((sum: number, d: any) => sum + d.temperatura, 0) / (data.length - midPoint);
      const tempTrend = ((secondHalfTemp - firstHalfTemp) / firstHalfTemp) * 100;

      const firstHalfPrecip = data.slice(0, midPoint).reduce((sum: number, d: any) => sum + d.precipitacion, 0);
      const secondHalfPrecip = data.slice(midPoint).reduce((sum: number, d: any) => sum + d.precipitacion, 0);
      const precipTrend = ((secondHalfPrecip - firstHalfPrecip) / Math.max(firstHalfPrecip, 1)) * 100;

      setStats({
        avgTemp: Math.round(avgTemp * 10) / 10,
        totalPrecip: Math.round(totalPrecip),
        avgHumidity: Math.round(avgHumidity),
        totalAlerts,
        tempTrend: Math.round(tempTrend * 10) / 10,
        precipTrend: Math.round(precipTrend * 10) / 10,
      });
    } catch (error) {
      toast.error('Error al cargar datos del reporte');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const blob = await reportsApi.exportPDF(selectedCrop, reportData);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-${selectedCrop}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Reporte descargado exitosamente');
    } catch (error) {
      toast.error('Error al descargar reporte');
      console.error(error);
    }
  };

  const selectedCropData = crops.find(c => c.id === selectedCrop);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-blue-600" aria-hidden="true" />
            Reportes Climáticos
          </h1>
          <p className="text-gray-600 mt-1">Análisis detallado por cultivo y período</p>
        </div>
        <Tooltip content="Descargar reporte en PDF">
          <button
            onClick={handleDownload}
            disabled={loading || reportData.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Descargar reporte en PDF"
          >
            <Download className="w-5 h-5" aria-hidden="true" />
            Descargar PDF
          </button>
        </Tooltip>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Selección de Cultivo */}
          <div role="group" aria-labelledby="crop-label">
            <label id="crop-label" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Sprout className="w-4 h-4" aria-hidden="true" />
              Cultivo
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {crops.map(crop => (
                <Tooltip key={crop.id} content={`Ver datos de ${crop.name}`}>
                  <button
                    onClick={() => setSelectedCrop(crop.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedCrop === crop.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    aria-pressed={selectedCrop === crop.id}
                    aria-label={crop.name}
                  >
                    <span className="text-2xl block mb-1" aria-hidden="true">{crop.icon}</span>
                    <span className="text-sm font-medium">{crop.name}</span>
                  </button>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Período */}
          <div role="group" aria-labelledby="period-label">
            <label id="period-label" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" aria-hidden="true" />
              Período
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Seleccionar período"
            >
              {periods.map(period => (
                <option key={period.id} value={period.id}>{period.name}</option>
              ))}
            </select>

            {selectedPeriod === 'custom' && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <input
                  type="date"
                  value={customDateFrom}
                  onChange={(e) => setCustomDateFrom(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  aria-label="Fecha desde"
                />
                <input
                  type="date"
                  value={customDateTo}
                  onChange={(e) => setCustomDateTo(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  aria-label="Fecha hasta"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Temp. Promedio</span>
            {stats.tempTrend !== 0 && (
              stats.tempTrend > 0 ? (
                <TrendingUp className="w-4 h-4 text-red-500" aria-label="Tendencia al alza" />
              ) : (
                <TrendingDown className="w-4 h-4 text-blue-500" aria-label="Tendencia a la baja" />
              )
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.avgTemp}°C</p>
          {stats.tempTrend !== 0 && (
            <p className={`text-xs mt-1 ${stats.tempTrend > 0 ? 'text-red-600' : 'text-blue-600'}`}>
              {stats.tempTrend > 0 ? '+' : ''}{stats.tempTrend}% vs período anterior
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Precipitación Total</span>
            {stats.precipTrend !== 0 && (
              stats.precipTrend > 0 ? (
                <TrendingUp className="w-4 h-4 text-blue-500" aria-label="Tendencia al alza" />
              ) : (
                <TrendingDown className="w-4 h-4 text-orange-500" aria-label="Tendencia a la baja" />
              )
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalPrecip} mm</p>
          {stats.precipTrend !== 0 && (
            <p className={`text-xs mt-1 ${stats.precipTrend > 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              {stats.precipTrend > 0 ? '+' : ''}{stats.precipTrend}% vs período anterior
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <span className="text-sm text-gray-600 block mb-2">Humedad Promedio</span>
          <p className="text-2xl font-bold text-gray-900">{stats.avgHumidity}%</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" aria-hidden="true" />
            <span className="text-sm text-gray-600">Total Alertas</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalAlerts}</p>
        </motion.div>
      </div>

      {/* Gráficos */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" role="status" aria-label="Cargando datos"></div>
          <p className="text-gray-600 mt-4">Cargando datos del reporte...</p>
        </div>
      ) : reportData.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" aria-hidden="true" />
          <p className="text-gray-600">No hay datos disponibles para el período seleccionado</p>
        </div>
      ) : (
        <>
          {/* Temperatura */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Temperatura - {selectedCropData?.name} {selectedCropData?.icon}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <ReferenceLine y={15} stroke="orange" strokeDasharray="3 3" label="Riesgo Helada" />
                <ReferenceLine y={25} stroke="red" strokeDasharray="3 3" label="Estrés Térmico" />
                <Line type="monotone" dataKey="temperatura" stroke="#3b82f6" strokeWidth={2} name="Temperatura (°C)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Precipitación */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Precipitación Acumulada</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <ReferenceLine y={50} stroke="orange" strokeDasharray="3 3" label="Lluvia Intensa" />
                <Bar dataKey="precipitacion" fill="#06b6d4" name="Precipitación (mm)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Humedad y Alertas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Humedad Relativa</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={reportData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="humedad" stroke="#10b981" strokeWidth={2} name="Humedad (%)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas por Día</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={reportData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="alertas" fill="#f97316" name="Alertas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
