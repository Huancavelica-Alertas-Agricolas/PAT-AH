// Comentarios añadidos en español: componente `AlertFilters` que ofrece controles para filtrar alertas.
// Cómo lo logra: expone selects y toggles para filtrar por tipo, fecha y zona y emite callbacks.
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, X, Calendar, MapPin, AlertTriangle } from 'lucide-react';
import Tooltip from './Tooltip';

export interface AlertFilterState {
  type: string[];
  severity: string[];
  zone: string[];
  dateFrom: string;
  dateTo: string;
}

interface AlertFiltersProps {
  filters: AlertFilterState;
  onFiltersChange: (filters: AlertFilterState) => void;
  onReset: () => void;
  zones: Array<{ id: string; name: string }>;
}

const alertTypes = [
  { id: 'helada', name: 'Helada', color: 'bg-blue-100 text-blue-800' },
  { id: 'granizada', name: 'Granizada', color: 'bg-purple-100 text-purple-800' },
  { id: 'sequia', name: 'Sequía', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'lluvia', name: 'Lluvia Intensa', color: 'bg-cyan-100 text-cyan-800' },
  { id: 'viento', name: 'Viento Fuerte', color: 'bg-gray-100 text-gray-800' },
];

const severityLevels = [
  { id: 'critica', name: 'Crítica', color: 'bg-red-100 text-red-800' },
  { id: 'alta', name: 'Alta', color: 'bg-orange-100 text-orange-800' },
  { id: 'media', name: 'Media', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'baja', name: 'Baja', color: 'bg-green-100 text-green-800' },
];

export default function AlertFilters({ filters, onFiltersChange, onReset, zones }: AlertFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTypeToggle = (typeId: string) => {
    const newTypes = filters.type.includes(typeId)
      ? filters.type.filter(t => t !== typeId)
      : [...filters.type, typeId];
    onFiltersChange({ ...filters, type: newTypes });
  };

  const handleSeverityToggle = (severityId: string) => {
    const newSeverities = filters.severity.includes(severityId)
      ? filters.severity.filter(s => s !== severityId)
      : [...filters.severity, severityId];
    onFiltersChange({ ...filters, severity: newSeverities });
  };

  const handleZoneToggle = (zoneId: string) => {
    const newZones = filters.zone.includes(zoneId)
      ? filters.zone.filter(z => z !== zoneId)
      : [...filters.zone, zoneId];
    onFiltersChange({ ...filters, zone: newZones });
  };

  const hasActiveFilters = 
    filters.type.length > 0 || 
    filters.severity.length > 0 || 
    filters.zone.length > 0 || 
    filters.dateFrom || 
    filters.dateTo;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-600" aria-hidden="true" />
          <h3 className="font-semibold text-gray-900">Filtros Avanzados</h3>
          {hasActiveFilters && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full" aria-label="Filtros activos">
              {filters.type.length + filters.severity.length + filters.zone.length + (filters.dateFrom ? 1 : 0) + (filters.dateTo ? 1 : 0)} activos
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Tooltip content="Limpiar todos los filtros">
              <button
                onClick={onReset}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors"
                aria-label="Limpiar filtros"
              >
                <X className="w-4 h-4" aria-hidden="true" />
                Limpiar
              </button>
            </Tooltip>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Ocultar filtros" : "Mostrar filtros"}
          >
            {isExpanded ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="border-t border-gray-200 p-4 space-y-6"
        >
          {/* Tipo de Alerta */}
          <div role="group" aria-labelledby="filter-type-label">
            <label id="filter-type-label" className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" aria-hidden="true" />
              Tipo de Alerta
            </label>
            <div className="flex flex-wrap gap-2">
              {alertTypes.map(type => (
                <Tooltip key={type.id} content={`Filtrar por ${type.name}`}>
                  <button
                    onClick={() => handleTypeToggle(type.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      filters.type.includes(type.id)
                        ? type.color + ' ring-2 ring-offset-1 ring-current'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    aria-pressed={filters.type.includes(type.id)}
                    aria-label={`${type.name}${filters.type.includes(type.id) ? ' (seleccionado)' : ''}`}
                  >
                    {type.name}
                  </button>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Severidad */}
          <div role="group" aria-labelledby="filter-severity-label">
            <label id="filter-severity-label" className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" aria-hidden="true" />
              Severidad
            </label>
            <div className="flex flex-wrap gap-2">
              {severityLevels.map(severity => (
                <Tooltip key={severity.id} content={`Filtrar por severidad ${severity.name}`}>
                  <button
                    onClick={() => handleSeverityToggle(severity.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      filters.severity.includes(severity.id)
                        ? severity.color + ' ring-2 ring-offset-1 ring-current'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    aria-pressed={filters.severity.includes(severity.id)}
                    aria-label={`Severidad ${severity.name}${filters.severity.includes(severity.id) ? ' (seleccionado)' : ''}`}
                  >
                    {severity.name}
                  </button>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Zona */}
          <div role="group" aria-labelledby="filter-zone-label">
            <label id="filter-zone-label" className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" aria-hidden="true" />
              Zona Geográfica
            </label>
            <div className="flex flex-wrap gap-2">
              {zones.map(zone => (
                <Tooltip key={zone.id} content={`Filtrar por ${zone.name}`}>
                  <button
                    onClick={() => handleZoneToggle(zone.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      filters.zone.includes(zone.id)
                        ? 'bg-blue-100 text-blue-800 ring-2 ring-offset-1 ring-blue-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    aria-pressed={filters.zone.includes(zone.id)}
                    aria-label={`${zone.name}${filters.zone.includes(zone.id) ? ' (seleccionado)' : ''}`}
                  >
                    {zone.name}
                  </button>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Rango de Fechas */}
          <div role="group" aria-labelledby="filter-date-label">
            <label id="filter-date-label" className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" aria-hidden="true" />
              Rango de Fechas
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date-from" className="block text-xs text-gray-600 mb-1">Desde</label>
                <input
                  id="date-from"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Fecha desde"
                />
              </div>
              <div>
                <label htmlFor="date-to" className="block text-xs text-gray-600 mb-1">Hasta</label>
                <input
                  id="date-to"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Fecha hasta"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
