const { Controller, Logger } = require('@nestjs/common');
const { MessagePattern } = require('@nestjs/microservices');
const { WeatherService } = require('./weather.service');
const { RiesgoClimaService } = require('./riesgo-clima.service');

class WeatherController {
  constructor(weatherService, riesgoClimaService) {
    this.logger = new Logger(WeatherController.name);
    this.weatherService = weatherService;
    this.riesgoClimaService = riesgoClimaService;
  }

  async getClimateAlerts() {
    this.logger.log('Generando alertas climáticas...');
    return await this.riesgoClimaService.generarAlertas();
  }

  async generateWeatherReport() {
    this.logger.log('Generando reporte meteorológico...');
    return await this.weatherService.generateAndSaveWeatherReport();
  }

  async getWeatherData() {
    this.logger.log('Obteniendo datos meteorológicos...');
    return await this.weatherService.getCurrentWeatherData();
  }

  async saveHistoricalData() {
    this.logger.log('Guardando datos históricos de SENAMHI...');
    return await this.weatherService.saveHistoricalDataFromSenamhi();
  }
}

module.exports = { WeatherController };
