const { Module } = require('@nestjs/common');
// Comentarios añadidos en español: módulo de `alerts` que registra el resolver y expone el servicio.
// Cómo lo logra: declara `AlertResolver` y `PrismaService` en `providers` y exporta el resolver para uso en otros módulos.
const { AlertResolver } = require('./alert.resolver');
const { PrismaService } = require('../prisma.service');

let AlertModule = class AlertModule {};
AlertModule = Module({
  providers: [AlertResolver, PrismaService],
  exports: [AlertResolver],
})(AlertModule) || AlertModule;

module.exports = { AlertModule };
