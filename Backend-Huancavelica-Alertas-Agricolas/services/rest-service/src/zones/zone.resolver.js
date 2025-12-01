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
exports.ZoneResolver = void 0;

const graphql_1 = require('@nestjs/graphql');
const prisma_service_1 = require('../prisma.service');

let ZoneResolver = class ZoneResolver {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async getZones() {
    const zones = await this.prisma.zone.findMany({
      orderBy: {
        nombre: 'asc',
      },
    });

    return zones.map(zone => ({
      id: zone.id,
      name: zone.nombre,
      region: zone.region,
      activeAlerts: zone.alertasActivas,
      population: zone.poblacion,
      coordinates: {
        lat: zone.latitud,
        lng: zone.longitud,
      },
    }));
  }

  async getZoneById(id) {
    const zone = await this.prisma.zone.findUnique({
      where: { id },
    });

    if (!zone) return null;

    return {
      id: zone.id,
      name: zone.nombre,
      region: zone.region,
      activeAlerts: zone.alertasActivas,
      population: zone.poblacion,
      coordinates: {
        lat: zone.latitud,
        lng: zone.longitud,
      },
    };
  }
};

__decorate([
  (0, graphql_1.Query)(() => [Object]),
  __metadata("design:type", Function),
  __metadata("design:paramtypes", []),
  __metadata("design:returntype", Promise)
], ZoneResolver.prototype, "getZones", null);

__decorate([
  (0, graphql_1.Query)(() => Object, { nullable: true }),
  __param(0, (0, graphql_1.Args)('id')),
  __metadata("design:type", Function),
  __metadata("design:paramtypes", [String]),
  __metadata("design:returntype", Promise)
], ZoneResolver.prototype, "getZoneById", null);

ZoneResolver = __decorate([
  (0, graphql_1.Resolver)('Zone'),
  __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ZoneResolver);

exports.ZoneResolver = ZoneResolver;
