/**
 * Weather Service using OpenWeatherMap API
 * Consulta datos climáticos y detecta condiciones adversas
 */

const fetch = require('node-fetch');

class WeatherService {
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY;
    this.baseUrl = process.env.OPENWEATHER_BASE_URL || 'https://api.openweathermap.org/data/2.5';
    // Coordenadas de Huancavelica
    this.defaultLat = process.env.DEFAULT_LAT || -12.7867;
    this.defaultLon = process.env.DEFAULT_LON || -74.9758;
  }

  /**
   * Obtiene datos climáticos actuales
   * @param {number} lat - Latitud
   * @param {number} lon - Longitud
   * @returns {Promise<Object>}
   */
  async getCurrentWeather(lat = this.defaultLat, lon = this.defaultLon) {
    if (!this.apiKey) {
      console.warn('OpenWeatherMap API key not configured');
      return this._getMockWeatherData();
    }

    try {
      const url = `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&lang=es`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this._parseWeatherData(data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return this._getMockWeatherData();
    }
  }

  /**
   * Parsea los datos de la API
   * @private
   */
  _parseWeatherData(data) {
    return {
      temperatura: data.main?.temp || 0,
      humedad: data.main?.humidity || 0,
      precipitacion: data.rain?.['1h'] || 0,
      velocidadViento: data.wind?.speed || 0,
      descripcion: data.weather?.[0]?.description || '',
    };
  }

  /**
   * Detecta condiciones adversas que requieren alerta
   * @param {Object} weatherData - Datos climáticos
   * @returns {Array<Object>} Array de alertas detectadas
   */
  detectAdverseConditions(weatherData) {
    const alerts = [];

    // Helada: Temperatura < 0°C
    if (weatherData.temperatura < 0) {
      alerts.push({
        tipo: 'helada',
        severidad: 'alta',
        titulo: 'Alerta de Helada',
        descripcion: `Temperatura de ${weatherData.temperatura}°C. Riesgo de daño a cultivos.`,
      });
    }

    // Lluvia intensa: Precipitación > 50mm
    if (weatherData.precipitacion > 50) {
      alerts.push({
        tipo: 'lluvia',
        severidad: 'alta',
        titulo: 'Lluvia Intensa',
        descripcion: `Precipitación de ${weatherData.precipitacion}mm. Riesgo de inundación.`,
      });
    }

    // Vientos fuertes: > 40 km/h
    if (weatherData.velocidadViento > 40) {
      alerts.push({
        tipo: 'viento',
        severidad: 'media',
        titulo: 'Vientos Fuertes',
        descripcion: `Vientos de ${weatherData.velocidadViento} km/h. Proteger estructuras.`,
      });
    }

    // Temperatura muy alta: > 30°C (sequía potencial)
    if (weatherData.temperatura > 30 && weatherData.humedad < 30) {
      alerts.push({
        tipo: 'sequia',
        severidad: 'media',
        titulo: 'Condiciones de Sequía',
        descripcion: `Temperatura ${weatherData.temperatura}°C y humedad ${weatherData.humedad}%. Riego necesario.`,
      });
    }

    return alerts;
  }

  /**
   * Datos mock para desarrollo
   * @private
   */
  _getMockWeatherData() {
    return {
      temperatura: 15 + Math.random() * 10,
      humedad: 60 + Math.random() * 20,
      precipitacion: Math.random() * 5,
      velocidadViento: 10 + Math.random() * 15,
      descripcion: 'Parcialmente nublado',
    };
  }
}

module.exports = new WeatherService();
