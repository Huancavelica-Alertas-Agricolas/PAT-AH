const { Module } = require('@nestjs/common');
const { PrometheusModule } = require('@willsoto/nestjs-prometheus');
const { ConfigModule } = require('@nestjs/config');
const { MailModule } = require('./mail/mail.module');
const { NotificationController } = require('./notification.controller');
const { NotificationService } = require('./notification.service');

const moduleConfig = {
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MailModule,
    PrometheusModule.register(),
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
};

class AppModule {}

module.exports = { AppModule };