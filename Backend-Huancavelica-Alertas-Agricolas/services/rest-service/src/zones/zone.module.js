const { Module } = require('@nestjs/common');
// Comentarios añadidos en español: módulo de `zones` que registra el resolver y expone el servicio.
// Cómo lo logra: declara `ZoneResolver` y `PrismaService` en `providers` y exporta el resolver.
const { ZoneResolver } = require('./zone.resolver');
const { PrismaService } = require('../prisma.service');

class ZoneModule {}

const decoratedModule = Module({
  providers: [ZoneResolver, PrismaService],
  exports: [ZoneResolver],
})(ZoneModule);

module.exports = { ZoneModule: decoratedModule };
