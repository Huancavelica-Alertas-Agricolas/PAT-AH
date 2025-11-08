import { AlertTriangle, Snowflake, CloudRain, Sun, Zap, Wind, Clock, MapPin } from 'lucide-react';
import { Card, CardContent, Badge } from '../ui';
import { Alert, SeverityLevel } from '../../types';
import { SEVERITY_COLORS, ALERT_TYPES } from '../../utils/constants';

interface AlertCardProps {
  alert: Alert;
  onClick?: () => void;
}

export const AlertCard = ({ alert, onClick }: AlertCardProps) => {
  const getSeverityConfig = (severity: SeverityLevel) => {
    const configs = {
      alto: {
        color: SEVERITY_COLORS.alto,
        bgColor: 'bg-red-50',
        textColor: 'text-red-900',
        borderColor: 'border-red-200'
      },
      medio: {
        color: SEVERITY_COLORS.medio,
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-900',
        borderColor: 'border-yellow-200'
      },
      bajo: {
        color: SEVERITY_COLORS.bajo,
        bgColor: 'bg-green-50',
        textColor: 'text-green-900',
        borderColor: 'border-green-200'
      }
    };
    return configs[severity];
  };

  const getAlertIcon = (type: string) => {
    const emojiMap = {
      helada: '❄️',
      lluvia_intensa: '🌧️',
      sequia: '☀️',
      granizo: '⛈️',
      viento_fuerte: '💨'
    };
    return emojiMap[type as keyof typeof emojiMap] || '⚠️';
  };

  const formatTimeRemaining = (validUntil: Date) => {
    const now = new Date();
    const diff = validUntil.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diff <= 0) return 'Expirada';
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const severityConfig = getSeverityConfig(alert.severity);

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${severityConfig.bgColor} ${severityConfig.borderColor} border-l-4`}
      style={{ borderLeftColor: severityConfig.color }}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div 
              className="p-3 rounded-xl bg-white shadow-sm"
            >
              <span className="text-2xl" role="img" aria-hidden="true">
                {getAlertIcon(alert.type)}
              </span>
            </div>
            <div>
              <h3 className={`font-medium ${severityConfig.textColor}`}>
                {alert.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {ALERT_TYPES[alert.type]}
              </p>
            </div>
          </div>
          
          <Badge 
            variant="secondary"
            className="text-xs"
            style={{ 
              backgroundColor: severityConfig.color,
              color: 'white'
            }}
          >
            {alert.severity.toUpperCase()}
          </Badge>
        </div>

        <p className={`text-sm mb-3 ${severityConfig.textColor}`}>
          {alert.description}
        </p>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{formatTimeRemaining(alert.validUntil)}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <MapPin className="h-3 w-3" />
            <span>{alert.affectedAreas[0]}</span>
            {alert.affectedAreas.length > 1 && (
              <span>+{alert.affectedAreas.length - 1}</span>
            )}
          </div>
        </div>

        {alert.isActive && (
          <div className="mt-3 flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-700 font-medium">Activa</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};