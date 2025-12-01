const { Module } = require('@nestjs/common');
const { NotificationResolver } = require('./notification.resolver');
const { PrismaService } = require('../prisma.service');

class NotificationModule {}

const decoratedModule = Module({
  providers: [NotificationResolver, PrismaService],
  exports: [NotificationResolver],
})(NotificationModule);

module.exports = { NotificationModule: decoratedModule };
