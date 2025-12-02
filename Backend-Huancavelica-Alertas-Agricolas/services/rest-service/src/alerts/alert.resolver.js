"use strict";
// Comentarios añadidos en español: resolver GraphQL para `alerts`.
// Cómo lo logra: expone queries/mutations/subscriptions (getAlerts, createAlert, updateAlertStatus, onNewAlert) usando `PrismaService`.
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
exports.AlertResolver = exports.pubSub = void 0;

const graphql_1 = require('@nestjs/graphql');
const prisma_service_1 = require('../prisma.service');
const graphql_subscriptions_1 = require('graphql-subscriptions');
const recommendations_data_1 = require('../../../shared/recommendations.data');

const pubSub = new graphql_subscriptions_1.PubSub();
exports.pubSub = pubSub;

let AlertResolver = class AlertResolver {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async getAlerts(filter) {
    const where = {};
    
    if (filter && filter.type && filter.type.length > 0) {
      where.tipo = { in: filter.type };
    }
    
    if (filter && filter.severity && filter.severity.length > 0) {
      where.severidad = { in: filter.severity };
    }
    
    if (filter && filter.zone && filter.zone.length > 0) {
      where.zona = { in: filter.zone };
    }
    
    if (filter && filter.status && filter.status.length > 0) {
      where.estado = { in: filter.status };
    }
    
    if (filter && filter.dateFrom) {
      where.fecha = { ...where.fecha, gte: new Date(filter.dateFrom) };
    }
    
    if (filter && filter.dateTo) {
      where.fecha = { ...where.fecha, lte: new Date(filter.dateTo) };
    }

    const alerts = await this.prisma.alert.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            nombre: true,
            telefono: true,
          },
        },
      },
      orderBy: {
        fecha: 'desc',
      },
    });

    return alerts.map(alert => ({
      id: alert.id,
      title: alert.titulo,
      description: alert.descripcion,
      type: alert.tipo,
      severity: alert.severidad,
      priority: alert.prioridad,
      status: alert.estado,
      time: alert.fecha.toISOString(),
      location: alert.ubicacion,
      zone: alert.zona,
      reportedBy: alert.user ? alert.user.nombre : alert.reportadoPor,
      reportedAt: alert.createdAt.toISOString(),
      responseTime: alert.tiempoRespuesta,
    }));
  }

  async getAlertById(id) {
    const alert = await this.prisma.alert.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            nombre: true,
            telefono: true,
            email: true,
          },
        },
      },
    });

    if (!alert) return null;

    return {
      id: alert.id,
      title: alert.titulo,
      description: alert.descripcion,
      type: alert.tipo,
      severity: alert.severidad,
      priority: alert.prioridad,
      status: alert.estado,
      time: alert.fecha.toISOString(),
      location: alert.ubicacion,
      zone: alert.zona,
      reportedBy: alert.user ? alert.user.nombre : alert.reportadoPor,
      reportedAt: alert.createdAt.toISOString(),
      responseTime: alert.tiempoRespuesta,
    };
  }

  async getAlertRecommendations(type) {
    const recommendations = (0, recommendations_data_1.getRecommendationsByType)(type);
    
    return recommendations.map((rec, index) => ({
      id: `${type}-${index + 1}`,
      title: rec.titulo,
      description: rec.descripcion,
      priority: rec.prioridad,
    }));
  }

  async createAlert(input, userId) {
    const alert = await this.prisma.alert.create({
      data: {
        titulo: input.title,
        descripcion: input.description,
        tipo: input.type,
        severidad: input.severity,
        prioridad: input.priority || 'media',
        estado: 'activa',
        ubicacion: input.location,
        zona: input.zone,
        reportadoPor: input.reportedBy,
        userId: userId,
        fecha: input.time ? new Date(input.time) : new Date(),
      },
    });

    const formattedAlert = {
      id: alert.id,
      title: alert.titulo,
      description: alert.descripcion,
      type: alert.tipo,
      severity: alert.severidad,
      priority: alert.prioridad,
      status: alert.estado,
      time: alert.fecha.toISOString(),
      location: alert.ubicacion,
      zone: alert.zona,
      reportedBy: alert.reportadoPor,
      reportedAt: alert.createdAt.toISOString(),
    };

    pubSub.publish('newAlert', { onNewAlert: formattedAlert });

    if (userId) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { alertasReportadas: { increment: 1 } },
      });
    }

    if (alert.zona) {
      await this.prisma.zone.update({
        where: { nombre: alert.zona },
        data: { alertasActivas: { increment: 1 } },
      }).catch(() => {});
    }

    return formattedAlert;
  }

  async updateAlertStatus(id, status, responseTime) {
    const previousAlert = await this.prisma.alert.findUnique({ where: { id } });
    
    const alert = await this.prisma.alert.update({
      where: { id },
      data: {
        estado: status,
        tiempoRespuesta: responseTime,
        activa: status === 'activa',
      },
    });

    if (previousAlert && previousAlert.estado === 'activa' && status === 'resuelta' && alert.zona) {
      await this.prisma.zone.update({
        where: { nombre: alert.zona },
        data: { alertasActivas: { decrement: 1 } },
      }).catch(() => {});
    }

    return {
      id: alert.id,
      title: alert.titulo,
      status: alert.estado,
      responseTime: alert.tiempoRespuesta,
    };
  }

  onNewAlert(zone) {
    return pubSub.asyncIterator('newAlert');
  }
};

__decorate([
  (0, graphql_1.Query)(() => [Object]),
  __param(0, (0, graphql_1.Args)('filter', { nullable: true })),
  __metadata("design:type", Function),
  __metadata("design:paramtypes", [Object]),
  __metadata("design:returntype", Promise)
], AlertResolver.prototype, "getAlerts", null);

__decorate([
  (0, graphql_1.Query)(() => Object, { nullable: true }),
  __param(0, (0, graphql_1.Args)('id')),
  __metadata("design:type", Function),
  __metadata("design:paramtypes", [String]),
  __metadata("design:returntype", Promise)
], AlertResolver.prototype, "getAlertById", null);

__decorate([
  (0, graphql_1.Query)(() => [Object]),
  __param(0, (0, graphql_1.Args)('type')),
  __metadata("design:type", Function),
  __metadata("design:paramtypes", [String]),
  __metadata("design:returntype", Promise)
], AlertResolver.prototype, "getAlertRecommendations", null);

__decorate([
  (0, graphql_1.Mutation)(() => Object),
  __param(0, (0, graphql_1.Args)('input')),
  __param(1, (0, graphql_1.Args)('userId', { nullable: true })),
  __metadata("design:type", Function),
  __metadata("design:paramtypes", [Object, String]),
  __metadata("design:returntype", Promise)
], AlertResolver.prototype, "createAlert", null);

__decorate([
  (0, graphql_1.Mutation)(() => Object),
  __param(0, (0, graphql_1.Args)('id')),
  __param(1, (0, graphql_1.Args)('status')),
  __param(2, (0, graphql_1.Args)('responseTime', { nullable: true })),
  __metadata("design:type", Function),
  __metadata("design:paramtypes", [String, String, Number]),
  __metadata("design:returntype", Promise)
], AlertResolver.prototype, "updateAlertStatus", null);

__decorate([
  (0, graphql_1.Subscription)(() => Object, {
    filter: (payload, variables) => {
      if (!variables.zone) return true;
      return payload.onNewAlert.zone === variables.zone;
    },
  }),
  __param(0, (0, graphql_1.Args)('zone', { nullable: true })),
  __metadata("design:type", Function),
  __metadata("design:paramtypes", [String]),
  __metadata("design:returntype", void 0)
], AlertResolver.prototype, "onNewAlert", null);

AlertResolver = __decorate([
  (0, graphql_1.Resolver)('Alert'),
  __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AlertResolver);

exports.AlertResolver = AlertResolver;
