"use strict";
// Comentarios añadidos en español: resolver GraphQL para `notifications`.
// Cómo lo logra: expone queries/mutations/subscriptions (getNotifications, createNotification, markNotificationRead, markAllAsRead, onNotification) usando `PrismaService`.
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
Object.defineProperty(exports, "__esModule", { value: true});
exports.NotificationResolver = exports.notificationPubSub = void 0;

const graphql_1 = require('@nestjs/graphql');
const prisma_service_1 = require('../prisma.service');
const graphql_subscriptions_1 = require('graphql-subscriptions');

const notificationPubSub = new graphql_subscriptions_1.PubSub();
exports.notificationPubSub = notificationPubSub;

let NotificationResolver = class NotificationResolver {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async getNotifications(userId) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    return notifications.map(notif => ({
      id: notif.id,
      type: notif.tipo,
      title: notif.titulo,
      message: notif.mensaje,
      timestamp: notif.createdAt.toISOString(),
      read: notif.leido,
      priority: notif.prioridad,
      userId: notif.userId,
    }));
  }

  async getUnreadCount(userId) {
    const count = await this.prisma.notification.count({
      where: {
        userId,
        leido: false,
      },
    });

    return count;
  }

  async markNotificationRead(id) {
    try {
      await this.prisma.notification.update({
        where: { id },
        data: { leido: true },
      });
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  async markAllAsRead(userId) {
    try {
      await this.prisma.notification.updateMany({
        where: {
          userId,
          leido: false,
        },
        data: {
          leido: true,
        },
      });
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  async createNotification(input) {
    const notification = await this.prisma.notification.create({
      data: {
        tipo: input.type,
        titulo: input.title,
        mensaje: input.message,
        prioridad: input.priority || 'media',
        userId: input.userId,
      },
    });

    const formattedNotification = {
      id: notification.id,
      type: notification.tipo,
      title: notification.titulo,
      message: notification.mensaje,
      timestamp: notification.createdAt.toISOString(),
      read: notification.leido,
      priority: notification.prioridad,
      userId: notification.userId,
    };

    notificationPubSub.publish('newNotification', {
      onNotification: formattedNotification,
    });

    return formattedNotification;
  }

  onNotification(userId) {
    return notificationPubSub.asyncIterator('newNotification');
  }
};

__decorate([
  (0, graphql_1.Query)(() => [Object]),
  __param(0, (0, graphql_1.Args)('userId')),
  __metadata("design:type", Function),
  __metadata("design:paramtypes", [String]),
  __metadata("design:returntype", Promise)
], NotificationResolver.prototype, "getNotifications", null);

__decorate([
  (0, graphql_1.Query)(() => Number),
  __param(0, (0, graphql_1.Args)('userId')),
  __metadata("design:type", Function),
  __metadata("design:paramtypes", [String]),
  __metadata("design:returntype", Promise)
], NotificationResolver.prototype, "getUnreadCount", null);

__decorate([
  (0, graphql_1.Mutation)(() => Boolean),
  __param(0, (0, graphql_1.Args)('id')),
  __metadata("design:type", Function),
  __metadata("design:paramtypes", [String]),
  __metadata("design:returntype", Promise)
], NotificationResolver.prototype, "markNotificationRead", null);

__decorate([
  (0, graphql_1.Mutation)(() => Boolean),
  __param(0, (0, graphql_1.Args)('userId')),
  __metadata("design:type", Function),
  __metadata("design:paramtypes", [String]),
  __metadata("design:returntype", Promise)
], NotificationResolver.prototype, "markAllAsRead", null);

__decorate([
  (0, graphql_1.Mutation)(() => Object),
  __param(0, (0, graphql_1.Args)('input')),
  __metadata("design:type", Function),
  __metadata("design:paramtypes", [Object]),
  __metadata("design:returntype", Promise)
], NotificationResolver.prototype, "createNotification", null);

__decorate([
  (0, graphql_1.Subscription)(() => Object, {
    filter: (payload, variables) => {
      if (!variables.userId) return true;
      return payload.onNotification.userId === variables.userId;
    },
  }),
  __param(0, (0, graphql_1.Args)('userId')),
  __metadata("design:type", Function),
  __metadata("design:paramtypes", [String]),
  __metadata("design:returntype", void 0)
], NotificationResolver.prototype, "onNotification", null);

NotificationResolver = __decorate([
  (0, graphql_1.Resolver)('Notification'),
  __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationResolver);

exports.NotificationResolver = NotificationResolver;
