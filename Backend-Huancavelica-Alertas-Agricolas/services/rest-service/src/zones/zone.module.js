const { Module } = require('@nestjs/common');
const { ZoneResolver } = require('./zone.resolver');
const { PrismaService } = require('../prisma.service');

class ZoneModule {}

const decoratedModule = Module({
  providers: [ZoneResolver, PrismaService],
  exports: [ZoneResolver],
})(ZoneModule);

module.exports = { ZoneModule: decoratedModule };
