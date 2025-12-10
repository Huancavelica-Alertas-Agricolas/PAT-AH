"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherResolver = void 0;

const graphql_1 = require('@nestjs/graphql');
const prisma_service_1 = require('../shared/prisma/prisma.service');
const weather_data_type_1 = require('./weather-data.type');

let WeatherResolver = class WeatherResolver {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async getWeatherData(limit) {
    const weatherData = await this.prisma.weatherData.findMany({
      take: limit || 50,
      orderBy: {
        fecha: 'desc',
      },
    });

    return weatherData.map(data => ({
      id: data.id,
      temperatura: data.temperatura,
      humedad: data.humedad,
      presion: data.presion,
      velocidadViento: data.velocidadViento,
      direccionViento: data.direccionViento,
      zona: data.zona,
      fecha: data.fecha,
      createdAt: data.createdAt,
    }));
  }
};
exports.WeatherResolver = WeatherResolver;
__decorate([
    (0, graphql_1.Query)(() => [weather_data_type_1.WeatherData]),
    __param(0, (0, graphql_1.Args)('limit', { nullable: true, type: () => Number })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], WeatherResolver.prototype, "getWeatherData", null);
exports.WeatherResolver = WeatherResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WeatherResolver);
//# sourceMappingURL=weather.resolver.js.map