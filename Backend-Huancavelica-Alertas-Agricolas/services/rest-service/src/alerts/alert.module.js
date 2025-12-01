const { Module } = require('@nestjs/common');
const { AlertResolver } = require('./alert.resolver');
const { PrismaService } = require('../prisma.service');

let AlertModule = class AlertModule {};
AlertModule = Module({
  providers: [AlertResolver, PrismaService],
  exports: [AlertResolver],
})(AlertModule) || AlertModule;

module.exports = { AlertModule };
