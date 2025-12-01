// Comentarios añadidos en español: breve descripción y uso de parámetros por método.
const { Controller, Logger } = require('@nestjs/common');
const { MessagePattern, Payload } = require('@nestjs/microservices');
const { NotificationService } = require('./notification.service');

class NotificationController {
  // notificationService: instancia del servicio de notificaciones.
  constructor(notificationService) {
    this.notificationService = notificationService;
    this.logger = new Logger(NotificationController.name);
  }

  // Maneja distintos tipos de envío según `emailData`.
  // Usa: `to`=destinatario, `subject`=asunto, `template`=plantilla, `context`=datos plantilla, `text`=texto plano, `name`/`reportMessage`=alerta
  async sendEmail(emailData) {
    this.logger.log('Procesando solicitud de envío de email');
    this.logger.log(`Datos recibidos: ${JSON.stringify(emailData)}`);
    const { to, subject, template, context, text, name, reportMessage } = emailData;

    this.logger.log(`Variables extraídas - name: ${name}, reportMessage: ${reportMessage}, text: ${text}`);

    // Auto-detectar tipo de email basado en los campos
    if (name && reportMessage) {
      // Es una alerta meteorológica
      this.logger.log('Detectado: Alerta meteorológica');
      return await this.notificationService.sendWeatherAlert(to, name, reportMessage);
    }

    if (name && !reportMessage && !text) {
      // Es un email de bienvenida
      this.logger.log('Detectado: Email de bienvenida');
      return await this.notificationService.sendWelcomeEmail(to, name);
    }

    // Si se proporciona template específico, usarlo
    if (template && context) {
      this.logger.log(`Usando template específico: ${template}`);
      return await this.notificationService.sendEmail(to, subject, template, context);
    }

    // Si se proporciona solo texto plano, usar el método de texto plano
    if (text) {
      this.logger.log('Enviando email de texto plano');
      return await this.notificationService.sendPlainTextEmail(to, subject, text);
    }

    // Si no se puede determinar el tipo, enviar error
    return {
      success: false,
      message: 'No se pudo determinar el tipo de email. Proporciona: name+reportMessage (alerta), name (bienvenida), o text (texto plano)',
      error: 'Invalid email data'
    };
  }

  // Maneja envío de bienvenida o redirige a alerta si hay `reportMessage`.
  // Usa: `to`/`email`=destinatario, `name`=nombre
  async sendWelcomeEmail(data) {
    this.logger.log('Procesando solicitud de email de bienvenida');
    this.logger.log(`Datos recibidos en sendWelcomeEmail: ${JSON.stringify(data)}`);
    const { to, email, name, reportMessage } = data;
    const recipient = to || email; // Usar 'to' o 'email' como destinatario
    this.logger.log(`Destinatario: ${recipient}, Nombre: ${name}`);

    // Si hay reportMessage, es una alerta meteorológica
    if (reportMessage) {
      return await this.notificationService.sendWeatherAlert(recipient, name, reportMessage);
    }

    return await this.notificationService.sendWelcomeEmail(recipient, name);
  }

  // Maneja envío de alerta meteorológica.
  // Usa: `to`=destinatario, `name`=nombre, `reportMessage`=detalle de la alerta
  async sendWeatherAlert(data) {
    this.logger.log('Procesando solicitud de alerta meteorológica');
    const { to, name, reportMessage } = data;
    return await this.notificationService.sendWeatherAlert(to, name, reportMessage);
  }
}

Controller()(NotificationController);
MessagePattern('send_email')(NotificationController.prototype, 'sendEmail', Object.getOwnPropertyDescriptor(NotificationController.prototype, 'sendEmail'));
MessagePattern('send_welcome_email')(NotificationController.prototype, 'sendWelcomeEmail', Object.getOwnPropertyDescriptor(NotificationController.prototype, 'sendWelcomeEmail'));
MessagePattern('send_weather_alert')(NotificationController.prototype, 'sendWeatherAlert', Object.getOwnPropertyDescriptor(NotificationController.prototype, 'sendWeatherAlert'));

module.exports = { NotificationController };