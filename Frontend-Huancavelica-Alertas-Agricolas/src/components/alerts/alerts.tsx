"use client";
/* Consolidated Alerts Module */
import React, { useState } from 'react';
import { Filter, X, Search, Calendar, ArrowUpDown, RefreshCw, Wifi, WifiOff, Share2, MapPin, Clock, Thermometer, Wind, Droplets, MessageCircle, Send } from 'lucide-react';
import { UI } from '../public';
import { ALERT_TYPES, SEVERITY_COLORS } from '../../utils/constants';
import { useAlerts } from '../../hooks/useAlerts';
import { useLanguage } from '../../context/LanguageContext';
import { Alert as AlertType } from '../../types';

// ================= AlertFilter =================
export interface AlertFilterProps {
  filters: {
    type?: AlertType['type'];
    severity?: AlertType['severity'];
    showActive?: boolean;
    search?: string;
    sortBy?: 'date' | 'severity';
  };
  onFiltersChange: (filters: AlertFilterProps['filters']) => void;
  isVisible: boolean;
  onToggle: () => void;
}

export const AlertFilter: React.FC<AlertFilterProps> = ({ filters, onFiltersChange, isVisible, onToggle }) => {
  const hasActiveFilters = filters.type || filters.severity || filters.showActive !== undefined || filters.search;
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value === 'all' ? undefined : value });
  };
  const clearFilters = () => onFiltersChange({});
  return (
    <>
      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <UI.Input placeholder="🔍 Buscar alertas..." value={filters.search || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFilter('search', e.target.value || undefined)} className="pl-12 min-h-[48px] text-base" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UI.Button variant="outline" size="sm" onClick={onToggle} className="min-h-[44px]">
              <Filter className="h-4 w-4 mr-2" />
              🔧 Filtros
              {hasActiveFilters && (
                <UI.Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                  {Object.values(filters).filter(v => v !== undefined && v !== '').length}
                </UI.Badge>
              )}
            </UI.Button>
            {hasActiveFilters && (
              <UI.Button variant="ghost" size="sm" onClick={clearFilters} className="min-h-[44px] text-gray-500 hover:text-gray-700">
                <X className="h-4 w-4 mr-1" />
                Limpiar
              </UI.Button>
            )}
          </div>
          <UI.Select value={filters.sortBy || 'date'} onValueChange={(value: string) => updateFilter('sortBy', value)}>
            <UI.SelectTrigger className="w-48 min-h-[44px]"><ArrowUpDown className="h-4 w-4 mr-2" /><UI.SelectValue /></UI.SelectTrigger>
            <UI.SelectContent>
              <UI.SelectItem value="date">📅 Más recientes primero</UI.SelectItem>
              <UI.SelectItem value="severity">🚨 Por severidad</UI.SelectItem>
            </UI.SelectContent>
          </UI.Select>
        </div>
      </div>
      {isVisible && (
        <UI.Card className="mb-4">
          <UI.CardContent className="p-4 space-y-4">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">🔧 Filtros Avanzados</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <UI.Label className="font-medium">🌦️ Tipo de Alerta</UI.Label>
                  <UI.Select value={filters.type || 'all'} onValueChange={(v: string) => updateFilter('type', v)}>
                    <UI.SelectTrigger className="min-h-[48px]"><UI.SelectValue placeholder="Todas" /></UI.SelectTrigger>
                    <UI.SelectContent>
                      <UI.SelectItem value="all">📋 Todas</UI.SelectItem>
                      <UI.SelectItem value="helada">❄️ Helada</UI.SelectItem>
                      <UI.SelectItem value="lluvia_intensa">🌧️ Lluvia intensa</UI.SelectItem>
                      <UI.SelectItem value="viento_fuerte">💨 Viento fuerte</UI.SelectItem>
                      <UI.SelectItem value="granizo">🧊 Granizo</UI.SelectItem>
                      <UI.SelectItem value="sequia">☀️ Sequía</UI.SelectItem>
                    </UI.SelectContent>
                  </UI.Select>
                </div>
                <div className="space-y-2">
                  <UI.Label className="font-medium">🚨 Nivel de Severidad</UI.Label>
                  <UI.Select value={filters.severity || 'all'} onValueChange={(v: string) => updateFilter('severity', v)}>
                    <UI.SelectTrigger className="min-h-[48px]"><UI.SelectValue placeholder="Todas" /></UI.SelectTrigger>
                    <UI.SelectContent>
                      <UI.SelectItem value="all">📊 Todas</UI.SelectItem>
                      <UI.SelectItem value="alto">🔴 Altas</UI.SelectItem>
                      <UI.SelectItem value="medio">🟡 Medias</UI.SelectItem>
                      <UI.SelectItem value="bajo">🟢 Bajas</UI.SelectItem>
                    </UI.SelectContent>
                  </UI.Select>
                </div>
                <div className="space-y-2">
                  <UI.Label className="font-medium">⚡ Estado de la Alerta</UI.Label>
                  <div className="flex items-center space-x-2 h-12 px-3 border rounded-lg">
                    <UI.Switch id="active-filter" checked={filters.showActive === true} onCheckedChange={(c: boolean) => updateFilter('showActive', c ? true : undefined)} />
                    <UI.Label htmlFor="active-filter" className="text-sm">🔥 Solo alertas activas</UI.Label>
                  </div>
                </div>
              </div>
            </div>
          </UI.CardContent>
        </UI.Card>
      )}
    </>
  );
};

// ================= AlertDetail =================
interface AlertDetailProps { alert: AlertType; onClose: () => void; onShare: (a: AlertType) => void; }
export const AlertDetail: React.FC<AlertDetailProps> = ({ alert, onClose, onShare }) => {
  const [isOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const getSeverityColor = (sev: string) => SEVERITY_COLORS[sev as keyof typeof SEVERITY_COLORS] || '#6B7280';
  const getSeverityIcon = (s: string) => s === 'alto' ? '🔴' : s === 'medio' ? '🟡' : s === 'bajo' ? '🟢' : '⚪';
  const getAlertTypeIcon = (t: string) => ({ helada:'❄️', lluvia_intensa:'🌧️', viento_fuerte:'💨', granizo:'🧊', sequia:'☀️' } as any)[t] || '⚠️';
  const formatDateTime = (d: Date) => new Date(d).toLocaleString('es-PE',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <UI.Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <UI.CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-3">
                <div className="text-3xl">{getAlertTypeIcon(alert.type)}</div>
                <div className="text-2xl">{getSeverityIcon(alert.severity)}</div>
                <UI.Badge className="text-white font-medium" style={{backgroundColor:getSeverityColor(alert.severity)}}>{alert.severity.toUpperCase()}</UI.Badge>
                {alert.isActive && <UI.Badge variant="outline" className="text-green-700 border-green-300"><div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>Activa</UI.Badge>}
              </div>
              <UI.CardTitle className="text-xl mb-2">{getAlertTypeIcon(alert.type)} {alert.title}</UI.CardTitle>
              <p className="text-sm text-muted-foreground mb-2">{ALERT_TYPES[alert.type]}</p>
              <div className="text-sm text-gray-600">📅 {formatDateTime(alert.createdAt)}</div>
            </div>
            <UI.Button variant="ghost" size="sm" onClick={onClose} className="min-h-[44px] min-w-[44px] p-2 -mt-2 -mr-2" aria-label="Cerrar detalle"><X className="h-5 w-5" /></UI.Button>
          </div>
        </UI.CardHeader>
        <UI.CardContent className="space-y-6">
          {!isOnline && (
            <UI.Alert><UI.AlertDescription className="flex items-center gap-2"><WifiOff className="h-4 w-4" />💾 Información almacenada localmente</UI.AlertDescription></UI.Alert>
          )}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium mb-3 flex items-center gap-2">📋 Información Detallada</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Zona:</strong> {alert.affectedAreas?.join(', ')}</p>
              <p><strong>Duración estimada:</strong> 4 horas</p>
              <p><strong>Intensidad:</strong> {alert.severity === 'alto' ? 'Muy intensa' : alert.severity === 'medio' ? 'Moderada' : 'Leve'}</p>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">📝 Descripción</h3>
            <p className="text-gray-700">{alert.description}</p>
          </div>
          <UI.Separator />
          {alert.weatherData && (
            <>
              <div>
                <h3 className="font-medium mb-3">🌤️ Condiciones Meteorológicas</h3>
                <div className="grid gap-3">
                  {alert.weatherData.temperature !== undefined && <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200"><div className="text-2xl">🌡️</div><div><p className="text-sm font-medium text-blue-900">Temperatura mínima</p><p className="font-bold text-blue-600 text-lg">{alert.weatherData.temperature}°C</p></div></div>}
                  {alert.weatherData.windSpeed !== undefined && <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg border border-green-200"><div className="text-2xl">💨</div><div><p className="text-sm font-medium text-green-900">Velocidad del viento</p><p className="font-bold text-green-600 text-lg">{alert.weatherData.windSpeed} km/h</p></div></div>}
                  {alert.weatherData.rainfall !== undefined && <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg border border-purple-200"><div className="text-2xl">🌧️</div><div><p className="text-sm font-medium text-purple-900">Precipitación acumulada</p><p className="font-bold text-purple-600 text-lg">{alert.weatherData.rainfall} mm</p></div></div>}
                </div>
              </div>
              <UI.Separator />
            </>
          )}
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <h3 className="font-medium mb-3 flex items-center gap-2">💡 Recomendaciones Específicas</h3>
            <ul className="space-y-3">{alert.recommendations.map((r,i)=>(<li key={i} className="flex items-start space-x-3"><div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-medium mt-0.5">{i+1}</div><p className="text-gray-700 font-medium">{r}</p></li>))}</ul>
          </div>
          <UI.Separator />
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start space-x-3 mb-3"><Clock className="h-5 w-5 mt-0.5 text-gray-600" /><div className="text-sm"><p className="font-medium text-gray-900">📅 Fechas importantes</p><p className="text-gray-600 mt-1"><strong>Creada:</strong> {formatDateTime(alert.createdAt)}</p><p className="text-gray-600"><strong>Válida hasta:</strong> {formatDateTime(alert.validUntil)}</p></div></div>
              <div className="flex items-start space-x-3"><MapPin className="h-5 w-5 mt-0.5 text-gray-600" /><div className="text-sm"><p className="font-medium text-gray-900">📍 Zonas afectadas</p><p className="text-gray-600 mt-1">{alert.affectedAreas.join(', ')}</p></div></div>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2">📤 Compartir esta alerta</h3>
            <p className="text-sm text-gray-600 mb-3">Comparte esta información importante con otros agricultores</p>
            <div className="grid gap-3">
              <UI.Button className="w-full min-h-[48px] bg-green-600 hover:bg-green-700"><MessageCircle className="h-5 w-5 mr-2" />📱 WhatsApp</UI.Button>
              <UI.Button variant="outline" className="w-full min-h-[48px]"><Send className="h-5 w-5 mr-2" />📧 Telegram</UI.Button>
              <UI.Button variant="outline" className="w-full min-h-[48px]"><Share2 className="h-5 w-5 mr-2" />📞 SMS</UI.Button>
            </div>
          </div>
        </UI.CardContent>
      </UI.Card>
    </div>
  );
};

// ================= AlertsHistoryScreen =================
type AlertFilters = AlertFilterProps['filters'];
interface AlertsHistoryScreenProps { onAlertClick: (a: AlertType) => void; }
export const AlertsHistoryScreen: React.FC<AlertsHistoryScreenProps> = ({ onAlertClick }) => {
  const { language } = useLanguage();
  const { alerts, isLoading, filters, setFilters } = useAlerts();
  const typedFilters = filters as AlertFilters;
  const [showFilters, setShowFilters] = useState(false);
  const [isOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const filteredAlerts = alerts.filter(alert => {
    if (typedFilters.search) {
      const s = typedFilters.search.toLowerCase();
      if (!(
        alert.type.toLowerCase().includes(s) ||
        alert.description.toLowerCase().includes(s) ||
        (alert.affectedAreas && alert.affectedAreas.some(a => a.toLowerCase().includes(s)))
      )) return false;
    }
    if (typedFilters.type && alert.type !== typedFilters.type) return false;
    if (typedFilters.severity && alert.severity !== typedFilters.severity) return false;
    if (typedFilters.showActive && !alert.isActive) return false;
    return true;
  });
  const sortedAlerts = [...filteredAlerts].sort((a,b)=> typedFilters.sortBy === 'severity' ? ({alto:3,medio:2,bajo:1}[b.severity]-({alto:3,medio:2,bajo:1}[a.severity])) : new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime());
  const handleTryRefresh = () => {};
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-medium mb-2">📋 {language==='qu'?'Kallpachaykuna willakuy': language==='en'?'Alerts History':'Lista de Alertas Históricas'}</h1>
        <p className="text-gray-600">{language==='qu'?'Kallpachaykuna tukuy llaqta': language==='en'?'Complete climate alert history for your region':'Historial completo de alertas climáticas para tu región'}</p>
      </div>
      <AlertFilter filters={filters} onFiltersChange={setFilters} isVisible={showFilters} onToggle={()=>setShowFilters(!showFilters)} />
      {!isOnline && (
        <UI.Alert><UI.AlertDescription className="flex items-center justify-between"><span>💾 <strong>Modo offline:</strong> Mostrando {alerts.length} alertas locales</span><UI.Button variant="outline" size="sm" onClick={handleTryRefresh} className="min-h-[40px]"><RefreshCw className="h-4 w-4 mr-2" />Intentar</UI.Button></UI.AlertDescription></UI.Alert>
      )}
      {isLoading && <div className="text-center py-8"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p className="text-gray-600">Cargando alertas...</p></div>}
      {!isLoading && (
        <div className="mb-4"><div className="flex items-center justify-between text-sm text-gray-600"><span>📊 Mostrando {sortedAlerts.length} de {alerts.length} alertas{typedFilters.search && ` para \"${typedFilters.search}\"`}</span>{isOnline && <div className="flex items-center gap-1 text-green-600"><Wifi className="h-4 w-4" /><span>Online</span></div>}</div></div>
      )}
      {!isLoading && sortedAlerts.length>0 ? (
        <div className="space-y-4">{sortedAlerts.map(alert => <UI.Card key={alert.id} className="p-4 cursor-pointer" onClick={()=>onAlertClick(alert)}><div className="flex items-center justify-between"><div><div className="font-medium">{alert.title}</div><div className="text-xs text-gray-500">{alert.type}</div></div><UI.Badge variant="outline">{alert.severity}</UI.Badge></div></UI.Card>)}</div>
      ) : !isLoading && sortedAlerts.length===0 ? (
        <div className="text-center py-12"><div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center text-2xl">🔍</div><h3 className="text-lg font-medium mb-2">No se encontraron alertas</h3><p className="text-gray-600 mb-4">{typedFilters.search||typedFilters.type||typedFilters.severity||typedFilters.showActive?'No hay alertas que coincidan con los filtros.':'No hay alertas disponibles.'}</p>{(typedFilters.search||typedFilters.type||typedFilters.severity||typedFilters.showActive)&&<UI.Button variant="outline" onClick={()=>setFilters({})} className="min-h-[44px]">🧹 Limpiar filtros</UI.Button>}</div>
      ) : null}
    </div>
  );
};

export default { AlertFilter, AlertDetail, AlertsHistoryScreen };