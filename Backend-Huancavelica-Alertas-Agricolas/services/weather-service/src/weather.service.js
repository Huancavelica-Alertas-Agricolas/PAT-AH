const { Injectable, Logger } = require('@nestjs/common');
const { HttpService } = require('@nestjs/axios');
const { ConfigService } = require('@nestjs/config');
const { InjectRepository } = require('@nestjs/typeorm');
const { firstValueFrom } = require('rxjs');
const { WeatherForecast } = require('./entities/weather-forecast.entity');
const { WeatherHistory } = require('./entities/weather-history.entity');

/**
 * @typedef {Object} WeatherRecord
 * @property {string} fecha_hora
 * @property {number} temp_c
 * @property {number} humedad
 * @property {string} clima
 * @property {number} prob_lluvia
 * @property {number} precip_mm
 * @property {boolean} [riesgo_helada]
 * @property {boolean} [riesgo_sequia]
 */

/**
 * @typedef {Object} WeatherResponse
 * @property {boolean} success
 * @property {string} message
 * @property {any} [data]
 * @property {string} [error]
 */

class WeatherService {
  constructor(
    httpService,
    configService,
    forecastRepository,
    historyRepository,
  ) {
    this.logger = new Logger(WeatherService.name);
    this.httpService = httpService;
    this.configService = configService;
    this.forecastRepository = forecastRepository;
    this.historyRepository = historyRepository;
  }

  async generateAndSaveWeatherReport() {
    this.logger.log('Iniciando la generación del reporte de clima...');
    
    try {
      const forecastData = await this.fetchWeatherForecastData();
      
      if (forecastData.length === 0) {
        this.logger.warn('No se encontraron datos de pronóstico.');
        return {
          success: false,
          message: 'No se encontraron datos de pronóstico para generar el reporte.',
        };
      }

      // Guardar los pronósticos en la base de datos
      const savedForecasts = await this.saveForecastsToDatabase(forecastData);
      
      this.logger.log(`Pronósticos guardados exitosamente: ${savedForecasts.length} registros`);
      return {
        success: true,
        message: `Reporte de pronóstico generado y guardado exitosamente`,
        data: {
          recordCount: savedForecasts.length,
          forecasts: savedForecasts,
        },
      };
    } catch (error) {
      this.logger.error('Error al generar el reporte de clima', error.stack);
      return {
        success: false,
        message: 'Error al generar el reporte de clima',
        error: error.message,
      };
    }
  }

  async getCurrentWeatherData() {
    this.logger.log('Obteniendo datos meteorológicos actuales...');
    
    try {
      // Obtener pronósticos de la base de datos
      const forecasts = await this.forecastRepository.find({
        where: {
          forecast_time: {
            $gte: new Date(),
          },
        },
        order: {
          forecast_time: 'ASC',
        },
        take: 50, // Limitar a 50 registros más recientes
      });

      // Si no hay datos en la base de datos, obtener de la API
      if (forecasts.length === 0) {
        this.logger.log('No hay pronósticos en base de datos, obteniendo de API...');
        const apiData = await this.fetchWeatherForecastData();
        const savedForecasts = await this.saveForecastsToDatabase(apiData);
        
        return {
          success: true,
          message: 'Datos meteorológicos obtenidos de API y guardados exitosamente',
          data: savedForecasts.map(this.transformForecastToWeatherRecord),
        };
      }
      
      return {
        success: true,
        message: 'Datos meteorológicos obtenidos exitosamente',
        data: forecasts.map(this.transformForecastToWeatherRecord),
      };
    } catch (error) {
      this.logger.error('Error al obtener datos meteorológicos', error.stack);
      return {
        success: false,
        message: 'Error al obtener datos meteorológicos',
        error: error.message,
      };
    }
  }

  async fetchWeatherForecastData() {
    const apiKey = this.configService.get('API_KEY');
    const lat = -12.7861;
    const lon = -74.9723;

    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=7&aqi=no&alerts=no`;

    try {
      const response = await firstValueFrom(this.httpService.get(url));
      const data = response.data;
      
      const forecastDays = data.forecast?.forecastday || [];
      const location = {
        name: 'Huancavelica',
        latitude: lat,
        longitude: lon,
        coordinates: [lon, lat],
      };

      return forecastDays.flatMap((dia) => 
        dia.hour.map((hora) => {
          const forecast = new WeatherForecast();
          forecast.location = location;
          forecast.forecast_time = new Date(hora.time);
          forecast.temperature_celsius = hora.temp_c;
          forecast.humidity_percentage = hora.humidity;
          forecast.precipitation_prob = hora.chance_of_rain;
          forecast.wind_speed_kmh = hora.wind_kph;
          forecast.wind_direction = hora.wind_dir;
          return forecast;
        })
      );
    } catch (error) {
      this.logger.error('Error al obtener datos de la API del clima', error.stack);
      throw new Error('No se pudieron obtener los datos meteorológicos');
    }
  }

  async saveForecastsToDatabase(forecasts) {
    try {
      return await this.forecastRepository.save(forecasts);
    } catch (error) {
      this.logger.error('Error al guardar pronósticos en base de datos', error.stack);
      throw new Error('No se pudieron guardar los datos de pronóstico');
    }
  }

  transformForecastToWeatherRecord = (forecast) => {
    return {
      fecha_hora: forecast.forecast_time.toISOString(),
      temp_c: forecast.temperature_celsius,
      humedad: forecast.humidity_percentage,
      clima: 'N/A', // No disponible en la nueva estructura
      prob_lluvia: forecast.precipitation_prob / 100, // Convertir porcentaje a decimal
      precip_mm: 0, // No disponible directamente, se calcularía basado en probabilidad
      riesgo_helada: forecast.temperature_celsius <= 0,
      riesgo_sequia: forecast.precipitation_prob < 10 && forecast.humidity_percentage < 40,
    };
  };

  // Método para guardar datos históricos desde archivo SENAMHI
  async saveHistoricalDataFromSenamhi() {
    this.logger.log('Guardando datos históricos de SENAMHI...');
    
    try {
      const { leerSenamhiExcel } = await import('./senamhi-reader');
      const senamhiData = leerSenamhiExcel();
      
      const location = {
        name: 'Huancavelica',
        latitude: -12.7861,
        longitude: -74.9723,
        coordinates: [-74.9723, -12.7861],
      };

      const historicalRecords = senamhiData.map(record => {
        const history = new WeatherHistory();
        history.location = location;
        history.recorded_time = new Date(record.fecha || Date.now());
        history.temperature_celsius = (record.temp_min + record.temp_max) / 2; // Promedio
        history.humidity_percentage = record.humedad;
        history.precipitation_mm = record.precipitacion;
        history.wind_speed_kmh = record.viento;
        return history;
      }).filter(record => !isNaN(record.recorded_time.getTime())); // Filtrar fechas inválidas

      const savedRecords = await this.historyRepository.save(historicalRecords);
      
      return {
        success: true,
        message: `Datos históricos guardados exitosamente: ${savedRecords.length} registros`,
        data: savedRecords,
      };
    } catch (error) {
      this.logger.error('Error al guardar datos históricos', error.stack);
      return {
        success: false,
        message: 'Error al guardar datos históricos',
        error: error.message,
      };
    }
  }
}

module.exports = { WeatherService };
