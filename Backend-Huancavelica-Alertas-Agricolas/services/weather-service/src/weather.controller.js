// Comentarios añadidos en español: encabezado breve y línea de uso por método.
const { Controller, Logger } = require('@nestjs/common');
const { MessagePattern } = require('@nestjs/microservices');
const { WeatherService } = require('./weather.service');
const { RiesgoClimaService } = require('./riesgo-clima.service');

class WeatherController {
  // weatherService, riesgoClimaService: instancias de servicios usados por el controller.
  constructor(weatherService, riesgoClimaService) {
    this.logger = new Logger(WeatherController.name);
    this.weatherService = weatherService;
    this.riesgoClimaService = riesgoClimaService;
  }

  // Genera alertas climáticas. No requiere parámetros.
  async getClimateAlerts() {
    this.logger.log('Generando alertas climáticas...');
    return await this.riesgoClimaService.generarAlertas();
  }

  // Genera y guarda reporte meteorológico. No requiere parámetros.
  async generateWeatherReport() {
    this.logger.log('Generando reporte meteorológico...');
    return await this.weatherService.generateAndSaveWeatherReport();
  }

  // Obtiene datos meteorológicos actuales. No requiere parámetros.
  async getWeatherData() {
    this.logger.log('Obteniendo datos meteorológicos...');
    return await this.weatherService.getCurrentWeatherData();
  }

  // Guarda datos históricos desde SENAMHI. No requiere parámetros.
  async saveHistoricalData() {
    this.logger.log('Guardando datos históricos de SENAMHI...');
    return await this.weatherService.saveHistoricalDataFromSenamhi();
  }
}

module.exports = { WeatherController };

// Register controller and message pattern handlers for microservice transport
Controller()(WeatherController);
MessagePattern('get_weather_data')(WeatherController.prototype, 'getWeatherData', Object.getOwnPropertyDescriptor(WeatherController.prototype, 'getWeatherData'));
