const { MailerModule } = require('@nestjs-modules/mailer');
const { HandlebarsAdapter } = require('@nestjs-modules/mailer/dist/adapters/handlebars.adapter');
const { Module } = require('@nestjs/common');
const { ConfigModule, ConfigService } = require('@nestjs/config');
const { join } = require('path');
const { MailService } = require('./mail.service');

const moduleConfig = {
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService) => ({
        transport: {
          host: configService.get('SMTP_HOST') || configService.get('MAIL_HOST') || 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: configService.get('SMTP_USER') || configService.get('MAIL_USER'),
            pass: configService.get('SMTP_PASS') || configService.get('MAIL_PASS'),
          },
        },
        defaults: {
          from: `"${configService.get('MAIL_FROM') || 'Agro-Alertas'}" <${configService.get('SMTP_USER') || configService.get('MAIL_USER')}>`,
        },
        template: {
          dir: '/app/dist/templates',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: false,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
};

class MailModule {}

module.exports = { MailModule };