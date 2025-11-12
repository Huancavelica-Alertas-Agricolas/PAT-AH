import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { WeatherDataDto } from '../dto/excel-data.dto';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly apiKey = process.env.OPENWEATHER_API_KEY || 'demo_key';
  private readonly baseUrl = 'https://api.openweathermap.org/data/2.5';

  /**
   * Obtiene datos meteorológicos actuales
   */
  async getCurrentWeather(lat: number, lon: number): Promise<WeatherDataDto> {
    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric',
          lang: 'es'
        }
      });

      const data = response.data;
      
      return {
        temperature: data.main.temp,
        humidity: data.main.humidity,
        precipitation: data.rain?.['1h'] || data.snow?.['1h'] || 0,
        windSpeed: data.wind.speed,
        pressure: data.main.pressure,
        date: new Date().toISOString(),
        location: data.name
      };
    } catch (error) {
      this.logger.error(`Error obteniendo datos del clima: ${error.message}`);
      throw new Error('No se pudieron obtener los datos meteorológicos');
    }
  }

  /**
   * Obtiene pronóstico del tiempo para los próximos días
   */
  async getForecast(lat: number, lon: number, days: number = 5): Promise<WeatherDataDto[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric',
          lang: 'es'
        }
      });

      const forecasts = response.data.list.slice(0, days * 8); // 8 mediciones por día (cada 3h)
      
      return forecasts.map((forecast: any) => ({
        temperature: forecast.main.temp,
        humidity: forecast.main.humidity,
        precipitation: forecast.rain?.['3h'] || forecast.snow?.['3h'] || 0,
        windSpeed: forecast.wind.speed,
        pressure: forecast.main.pressure,
        date: forecast.dt_txt,
        location: response.data.city.name
      }));
    } catch (error) {
      this.logger.error(`Error obteniendo pronóstico: ${error.message}`);
      throw new Error('No se pudo obtener el pronóstico meteorológico');
    }
  }

  /**
   * Obtiene datos meteorológicos por nombre de ciudad
   */
  async getWeatherByCity(cityName: string): Promise<WeatherDataDto> {
    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          q: cityName,
          appid: this.apiKey,
          units: 'metric',
          lang: 'es'
        }
      });

      const data = response.data;
      
      return {
        temperature: data.main.temp,
        humidity: data.main.humidity,
        precipitation: data.rain?.['1h'] || data.snow?.['1h'] || 0,
        windSpeed: data.wind.speed,
        pressure: data.main.pressure,
        date: new Date().toISOString(),
        location: data.name
      };
    } catch (error) {
      this.logger.error(`Error obteniendo clima para ${cityName}: ${error.message}`);
      throw new Error(`No se pudieron obtener datos del clima para ${cityName}`);
    }
  }

  /**
   * Obtiene datos históricos del clima (simulado con datos actuales)
   * En un entorno real, usarías una API que proporcione datos históricos
   */
  async getHistoricalWeather(
    lat: number, 
    lon: number, 
    startDate: Date, 
    endDate: Date
  ): Promise<WeatherDataDto[]> {
    try {
      // Por simplicidad, simulamos datos históricos
      // En producción, usarías APIs como OneCall API de OpenWeather
      const currentWeather = await this.getCurrentWeather(lat, lon);
      const historicalData: WeatherDataDto[] = [];
      
      const current = new Date(startDate);
      while (current <= endDate) {
        // Simular variación en los datos
        const variation = (Math.random() - 0.5) * 10;
        
        historicalData.push({
          temperature: currentWeather.temperature + variation,
          humidity: Math.max(0, Math.min(100, currentWeather.humidity + variation)),
          precipitation: Math.max(0, currentWeather.precipitation + Math.random() * 5),
          windSpeed: Math.max(0, currentWeather.windSpeed + (Math.random() - 0.5) * 5),
          pressure: currentWeather.pressure + (Math.random() - 0.5) * 50,
          date: current.toISOString(),
          location: currentWeather.location
        });
        
        current.setDate(current.getDate() + 1);
      }
      
      return historicalData;
    } catch (error) {
      this.logger.error(`Error obteniendo datos históricos: ${error.message}`);
      throw new Error('No se pudieron obtener datos históricos del clima');
    }
  }

  /**
   * Procesa datos meteorológicos para features de ML
   */
  processWeatherForML(weather: WeatherDataDto): number[] {
    return [
      weather.temperature,
      weather.humidity,
      weather.precipitation,
      weather.windSpeed,
      weather.pressure / 1000, // Normalizar presión
      this.getSeasonIndex(new Date(weather.date)),
      this.getDayOfYear(new Date(weather.date))
    ];
  }

  /**
   * Obtiene índice estacional (0-3)
   */
  private getSeasonIndex(date: Date): number {
    const month = date.getMonth();
    if (month >= 2 && month <= 4) return 0; // Primavera
    if (month >= 5 && month <= 7) return 1; // Verano
    if (month >= 8 && month <= 10) return 2; // Otoño
    return 3; // Invierno
  }

  /**
   * Obtiene día del año normalizado (0-1)
   */
  private getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return dayOfYear / 365;
  }

  /**
   * Verifica si la API key está configurada
   */
  isConfigured(): boolean {
    return this.apiKey !== 'demo_key' && this.apiKey.length > 0;
  }

  /**
   * Obtiene información sobre el estado de la API
   */
  async getApiStatus(): Promise<{ status: string; message: string }> {
    if (!this.isConfigured()) {
      return {
        status: 'warning',
        message: 'API key no configurada. Configure OPENWEATHER_API_KEY en las variables de entorno.'
      };
    }

    try {
      // Test básico con coordenadas de Lima, Perú
      await this.getCurrentWeather(-12.0464, -77.0428);
      return {
        status: 'ok',
        message: 'API del clima funcionando correctamente'
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Error en la API del clima: ${error.message}`
      };
    }
  }
}
