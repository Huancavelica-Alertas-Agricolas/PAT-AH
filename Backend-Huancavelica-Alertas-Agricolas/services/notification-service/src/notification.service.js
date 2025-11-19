const { Logger } = require('@nestjs/common');
const MailService = require('./mail/mail.service');

class NotificationService {
  constructor(mailService) {
    this.mailService = mailService;
    this.logger = new Logger(NotificationService.name);
  }

  async sendEmail(to, subject, template, context) {
    try {
      await this.mailService.sendMail(to, subject, template, context);
      return {
        success: true,
        message: `Email enviado exitosamente a ${to}`,
      };
    } catch (error) {
      this.logger.error(`Error enviando email a ${to}:`, error.stack);
      return {
        success: false,
        message: `Error enviando email a ${to}`,
        error: error.message,
      };
    }
  }

  async sendPlainTextEmail(to, subject, text) {
    try {
      await this.mailService.sendPlainTextMail(to, subject, text);
      return {
        success: true,
        message: `Email enviado exitosamente a ${to}`,
      };
    } catch (error) {
      this.logger.error(`Error enviando email a ${to}:`, error.stack);
      return {
        success: false,
        message: `Error enviando email a ${to}`,
        error: error.message,
      };
    }
  }

  async sendWelcomeEmail(to, name) {
    try {
      await this.mailService.sendWelcomeEmail(to, name);
      return {
        success: true,
        message: `Email de bienvenida enviado exitosamente a ${to}`,
      };
    } catch (error) {
      this.logger.error(`Error enviando email de bienvenida a ${to}:`, error.stack);
      return {
        success: false,
        message: `Error enviando email de bienvenida a ${to}`,
        error: error.message,
      };
    }
  }

  async sendWeatherAlert(to, name, reportMessage) {
    try {
      await this.mailService.sendWeatherAlert(to, name, reportMessage);
      return {
        success: true,
        message: `Alerta meteorológica enviada exitosamente a ${to}`,
      };
    } catch (error) {
      this.logger.error(`Error enviando alerta meteorológica a ${to}:`, error.stack);
      return {
        success: false,
        message: `Error enviando alerta meteorológica a ${to}`,
        error: error.message,
      };
    }
  }
}

module.exports = NotificationService;