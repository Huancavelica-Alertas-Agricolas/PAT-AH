import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Dot } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui';
import { Report } from '../../types';
import { SEVERITY_COLORS } from '../../utils/constants';

interface TemperatureChartProps {
  report: Report;
}

export const TemperatureChart = ({ report }: TemperatureChartProps) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-PE', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  const chartData = report.temperatureData.map(item => ({
    date: formatDate(item.date),
    temperature: item.temperature,
    hasAlert: item.hasAlert,
    fullDate: item.date
  }));

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload.hasAlert) return null;
    
    const alertColor = payload.temperature < 0 ? SEVERITY_COLORS.alto :
                     payload.temperature < 5 ? SEVERITY_COLORS.medio :
                     SEVERITY_COLORS.bajo;
    
    return (
      <Dot 
        cx={cx} 
        cy={cy} 
        r={6} 
        fill={alertColor}
        stroke="white"
        strokeWidth={2}
      />
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-blue-600">
            Temperatura: {data.temperature}°C
          </p>
          {data.hasAlert && (
            <p className="text-red-600 text-sm">
              ⚠️ Alerta registrada
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Temperaturas y Alertas</CardTitle>
        <p className="text-sm text-muted-foreground">
          Cultivo: {report.cropType.charAt(0).toUpperCase() + report.cropType.slice(1)} 
          • {formatDate(report.dateRange.start)} - {formatDate(report.dateRange.end)}
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                label={{ value: '°C', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Líneas de referencia para temperaturas críticas */}
              <ReferenceLine 
                y={0} 
                stroke={SEVERITY_COLORS.alto} 
                strokeDasharray="5 5"
                label={{ value: "Helada", position: "left" }}
              />
              <ReferenceLine 
                y={5} 
                stroke={SEVERITY_COLORS.medio} 
                strokeDasharray="5 5"
                label={{ value: "Riesgo", position: "left" }}
              />
              
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="transparent"
                dot={<CustomDot />}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Leyenda de alertas */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: SEVERITY_COLORS.alto }}
            ></div>
            <span>Alto riesgo (&lt; 0°C)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: SEVERITY_COLORS.medio }}
            ></div>
            <span>Riesgo medio (0-5°C)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: SEVERITY_COLORS.bajo }}
            ></div>
            <span>Riesgo bajo (&gt; 5°C)</span>
          </div>
        </div>

        {/* Resumen de alertas */}
        <div className="mt-4 grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: SEVERITY_COLORS.alto }}>
              {report.alertsCount.alto}
            </p>
            <p className="text-sm text-gray-600">Alto riesgo</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: SEVERITY_COLORS.medio }}>
              {report.alertsCount.medio}
            </p>
            <p className="text-sm text-gray-600">Riesgo medio</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: SEVERITY_COLORS.bajo }}>
              {report.alertsCount.bajo}
            </p>
            <p className="text-sm text-gray-600">Riesgo bajo</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};