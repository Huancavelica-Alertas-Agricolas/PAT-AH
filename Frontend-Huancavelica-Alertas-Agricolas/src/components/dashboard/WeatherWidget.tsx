import { RefreshCw, Thermometer, Droplets, Wind, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '../ui';
import { useWeather } from '../../hooks/useWeather';
import { useLanguage } from '../../context/LanguageContext';
import { useState } from 'react';
import { useToast } from '../../context/ToastContext';

export const WeatherWidget = () => {
  const { language } = useLanguage();
  const { weatherData, isLoading, lastUpdated, refreshWeather } = useWeather();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const toast = useToast();

  const formatTime = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleTimeString('es-PE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            🌤️ {language === 'qu' ? 'Clima kawsay' : language === 'en' ? 'Current Weather' : 'Clima Actual'}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              if (isLoading || isRefreshing) return;
              let id: string | undefined;
              try {
                setIsRefreshing(true);
                id = toast.show({ message: language === 'en' ? 'Updating...' : 'Actualizando...', type: 'info', duration: 0 });
                await refreshWeather();
                if (id) {
                  toast.update(id, { message: language === 'en' ? 'Updated' : 'Actualizado', type: 'success', duration: 2000 });
                }
              } catch (e) {
                if (id) {
                  toast.update(id, { message: language === 'en' ? 'Error updating' : 'Error al actualizar', type: 'error', duration: 4000 });
                } else {
                  toast.show({ message: language === 'en' ? 'Error updating' : 'Error al actualizar', type: 'error', duration: 4000 });
                }
              } finally {
                setIsRefreshing(false);
              }
            }}
            disabled={isLoading || isRefreshing}
            className="min-h-[44px] min-w-[44px] p-2"
            aria-label={language === 'qu' ? 'Clima kawsaykuna' : language === 'en' ? 'Update weather data' : 'Actualizar datos climáticos'}
            aria-busy={isRefreshing}
          >
            <RefreshCw className={`inline-block h-4 w-4 ${isRefreshing ? 'animate-spin debug-spin' : ''}`} />
          </Button>
        </div>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground">
            {language === 'qu' ? 'Qhipa tiempo' : language === 'en' ? 'Updated:' : 'Actualizado:'} {formatTime(lastUpdated)}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading && !weatherData ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="inline-block h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : weatherData ? (
          <>
            <div className="text-center py-2">
              <div className="text-3xl font-bold text-blue-600">
                {Math.round(weatherData.temperature)}°C
              </div>
              <p className="text-sm text-muted-foreground">
                {weatherData.location}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl">
                <span className="text-2xl" role="img" aria-label="lluvia">🌧️</span>
                <div>
                  <p className="text-sm font-medium text-blue-900">Lluvia</p>
                  <p className="text-xl font-bold text-blue-600">
                    {weatherData.rainfall}mm
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-xl">
                <span className="text-2xl" role="img" aria-label="viento">💨</span>
                <div>
                  <p className="text-sm font-medium text-green-900">Viento</p>
                  <p className="text-xl font-bold text-green-600">
                    {weatherData.windSpeed} km/h
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-xl">
                <span className="text-2xl" role="img" aria-label="humedad">💧</span>
                <div>
                  <p className="text-sm font-medium text-purple-900">Humedad</p>
                  <p className="text-xl font-bold text-purple-600">
                    {weatherData.humidity}%
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-orange-50 rounded-xl">
                <span className="text-2xl" role="img" aria-label="sensación">🌡️</span>
                <div>
                  <p className="text-sm font-medium text-orange-900">Sensación</p>
                  <p className="text-xl font-bold text-orange-600">
                    {Math.round(weatherData.temperature - 2)}°C
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No se pudieron cargar los datos climáticos</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};