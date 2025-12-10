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
exports.AlertResolver = exports.pubSub = void 0;

const graphql_1 = require('@nestjs/graphql');
const prisma_service_1 = require('../prisma.service');
const graphql_subscriptions_1 = require('graphql-subscriptions');
const recommendations_data_1 = require('../../../shared/recommendations.data');
const alert_filter_input_1 = require('./dto/alert-filter.input');
const create_alert_input_1 = require('./dto/create-alert.input');
const alert_type_1 = require('./alert.type');
const recommendation_type_1 = require('./recommendation.type');
const fetch = require('node-fetch');

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
        titulo: `${input.tipo} - ${input.zona}`, // Generar titulo basado en tipo y zona
        descripcion: input.descripcion,
        tipo: input.tipo,
        severidad: input.severidad,
        prioridad: 'media',
        estado: 'activa',
        ubicacion: input.ubicacion,
        zona: input.zona,
        latitud: input.latitud,
        longitud: input.longitud,
        reportadoPor: input.reportadoPor,
        userId: userId,
        fecha: new Date(),
      },
    });

    const formattedAlert = {
      id: alert.id,
      tipo: alert.tipo,
      severidad: alert.severidad,
      zona: alert.zona,
      estado: alert.estado,
      descripcion: alert.descripcion,
      ubicacion: alert.ubicacion,
      latitud: alert.latitud,
      longitud: alert.longitud,
      fecha: alert.fecha.toISOString(),
      reportadoPor: alert.reportadoPor,
      createdAt: alert.createdAt.toISOString(),
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

    // Send to n8n webhook for notifications
    try {
      const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'https://climatrack0.app.n8n.cloud/webhook/webhook/clima-alerta';
      
      // Get users in the alert zone to notify
      let recipients = [];
      if (alert.zona) {
        const zoneUsers = await this.prisma.user.findMany({
          where: { ciudad: alert.zona },
          select: { id: true, nombre: true, email: true, telefono: true, preferredChannel: true }
        });
        recipients = zoneUsers.map(user => ({
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          telefono: user.telefono,
          preferredChannel: user.preferredChannel || 'email'
        }));
      }

      const payload = {
        descripcion: alert.descripcion,
        tipo: alert.tipo,
        severidad: alert.severidad,
        zona: alert.zona,
        ubicacion: alert.ubicacion,
        recipients: recipients,
      };

      console.log('Sending alert to n8n webhook:', JSON.stringify(payload, null, 2));
      
      const response = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('n8n webhook response status:', response.status);
      const responseText = await response.text();
      console.log('n8n webhook response:', responseText);
      
    } catch (error) {
      console.error('Error sending to n8n webhook:', error);
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
  (0, graphql_1.Query)(() => [alert_type_1.Alert]),
  __param(0, (0, graphql_1.Args)('filter', { nullable: true, type: () => alert_filter_input_1.AlertFilterInput })),
  __metadata("design:type", Function),
  __metadata("design:paramtypes", [Object]),
  __metadata("design:returntype", Promise)
], AlertResolver.prototype, "getAlerts", null);

__decorate([
  (0, graphql_1.Query)(() => alert_type_1.Alert, { nullable: true }),
  __param(0, (0, graphql_1.Args)('id')),
  __metadata("design:type", Function),
  __metadata("design:paramtypes", [String]),
  __metadata("design:returntype", Promise)
], AlertResolver.prototype, "getAlertById", null);

__decorate([
  (0, graphql_1.Query)(() => [recommendation_type_1.Recommendation]),
  __param(0, (0, graphql_1.Args)('type')),
  __metadata("design:type", Function),
  __metadata("design:paramtypes", [String]),
  __metadata("design:returntype", Promise)
], AlertResolver.prototype, "getAlertRecommendations", null);

__decorate([
  (0, graphql_1.Mutation)(() => alert_type_1.Alert),
  __param(0, (0, graphql_1.Args)('input', { type: () => create_alert_input_1.CreateAlertInput })),
  __param(1, (0, graphql_1.Args)('userId', { nullable: true })),
  __metadata("design:type", Function),
  __metadata("design:paramtypes", [Object, String]),
  __metadata("design:returntype", Promise)
], AlertResolver.prototype, "createAlert", null);

__decorate([
  (0, graphql_1.Mutation)(() => alert_type_1.Alert),
  __param(0, (0, graphql_1.Args)('id')),
  __param(1, (0, graphql_1.Args)('status')),
  __param(2, (0, graphql_1.Args)('responseTime', { nullable: true })),
  __metadata("design:type", Function),
  __metadata("design:paramtypes", [String, String, Number]),
  __metadata("design:returntype", Promise)
], AlertResolver.prototype, "updateAlertStatus", null);

__decorate([
  (0, graphql_1.Subscription)(() => alert_type_1.Alert, {
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
