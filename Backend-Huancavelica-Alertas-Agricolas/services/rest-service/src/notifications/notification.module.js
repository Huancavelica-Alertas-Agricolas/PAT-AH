const { Module } = require('@nestjs/common');
// Comentarios añadidos en español: módulo de `notifications` que registra el resolver y expone el servicio.
// Cómo lo logra: declara `NotificationResolver` y `PrismaService` en `providers` y exporta el resolver.
const { NotificationResolver } = require('./notification.resolver');
const { PrismaService } = require('../prisma.service');

class NotificationModule {}

const decoratedModule = Module({
  providers: [NotificationResolver, PrismaService],
  exports: [NotificationResolver],
})(NotificationModule);

module.exports = { NotificationModule: decoratedModule };
