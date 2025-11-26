const nodemailer = require('nodemailer');

class Logger {
  constructor(context) {
    this.context = context;
  }
  log(message) {
    console.log(`[LOG] [${this.context}] ${message}`);
  }
  error(message, stack) {
    console.error(`[ERROR] [${this.context}] ${message}`);
    if (stack) {
      console.error(stack);
    }
  }
}

class MailService {
  constructor(mailerService) {
    this.mailerService = mailerService;
    this.logger = new Logger('MailService');
  }

  async sendMail(to, subject, template, context) {
    try {
      this.logger.log(`Enviando email a: ${to} con template: ${template}`);
      await this.mailerService.sendMail({
        to,
        subject,
        template,
        context,
      });
      this.logger.log(`Email enviado exitosamente a: ${to}`);
    } catch (error) {
      this.logger.error(`Error enviando email a ${to}:`, error.stack);
      throw error;
    }
  }

  async sendPlainTextMail(to, subject, text) {
    try {
      this.logger.log(`Enviando email de texto plano a: ${to}`);

      // Crear transporter directamente con nodemailer para evitar problemas con Handlebars
      const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST || 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"${process.env.MAIL_FROM}" <${process.env.MAIL_USER}>`,
        to,
        subject,
        text,
      });

      this.logger.log(`Email enviado exitosamente a: ${to}`);
    } catch (error) {
      this.logger.error(`Error enviando email a ${to}:`, error.stack);
      throw error;
    }
  }

  async sendWelcomeEmail(to, name) {
    this.logger.log('🎯 EJECUTANDO sendWelcomeEmail - MÉTODO ESPECÍFICO');

    // Si el nombre contiene "ALERTA", usar la plantilla de alerta
    if (name && name.includes('ALERTA')) {
      const reportMessage = name.split(' - ')[1] || 'Condiciones climáticas adversas detectadas';
      const cleanName = name.split(' - ')[0];
      this.logger.log('🌦️ Detectada palabra ALERTA - usando plantilla meteorológica');
      return await this.sendWeatherAlert(to, cleanName, reportMessage);
    }

    await this.sendMail(
      to,
      'Bienvenido a Agro-Alertas',
      'welcome',
      { name }
    );
  }

  async sendWeatherAlert(to, name, reportMessage) {
    try {
      this.logger.log(`🌦️ Enviando alerta meteorológica a: ${to} usando plantilla weather-alert`);

      // Usar el MailerService configurado con las plantillas
      await this.mailerService.sendMail({
        to,
        subject: '🌦️ Alerta Climática - Agro-Alertas Huancavelica',
        template: 'weather-alert', // nombre del archivo .hbs sin extensión
        context: {
          name: name,
          reportMessage: reportMessage,
          date: new Date().toLocaleDateString('es-ES'),
          time: new Date().toLocaleTimeString('es-ES'),
          location: 'Huancavelica'
        },
      });

      this.logger.log(`🌦️ Alerta meteorológica con plantilla enviada exitosamente a: ${to}`);
    } catch (error) {
      this.logger.error(`Error enviando alerta meteorológica a ${to}:`, error.stack);
      throw error;
    }
  }
}

module.exports = { MailService, Logger };