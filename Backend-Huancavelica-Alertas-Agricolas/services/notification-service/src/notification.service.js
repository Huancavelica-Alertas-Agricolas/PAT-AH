// Comentarios añadidos en español: solo explicaciones breves; lógica intacta.
const { Logger } = require('@nestjs/common');
const MailService = require('./mail/mail.service');

class NotificationService {
  // mailService: implementación concreta del servicio de correo.
  constructor(mailService) {
    this.mailService = mailService;
    this.logger = new Logger(NotificationService.name);
  }

  // Envía un correo usando una plantilla.
  // Usa: `to` = destinatario, `subject` = asunto, `template` = identificador de plantilla, `context` = datos para la plantilla
  async sendEmail(to, subject, template, context) {
    try {
      await this.mailService.sendMail(to, subject, template, context);
      return {
        success: true,
        message: `Email enviado exitosamente a ${to}`,
      };
    } catch (error) {
      // Registrar el stack y devolver un objeto de error sin lanzar excepción.
      this.logger.error(`Error enviando email a ${to}:`, error.stack);
      return {
        success: false,
        message: `Error enviando email a ${to}`,
        error: error.message,
      };
    }
  }

  // Envía un correo de texto plano.
  // Usa: `to` = destinatario, `subject` = asunto, `text` = cuerpo en texto plano
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

  // Envía un correo de bienvenida.
  // Usa: `to` = destinatario, `name` = nombre para personalizar la bienvenida
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

  // Envía una alerta meteorológica.
  // Usa: `to` = destinatario, `name` = nombre del destinatario, `reportMessage` = detalle del reporte
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