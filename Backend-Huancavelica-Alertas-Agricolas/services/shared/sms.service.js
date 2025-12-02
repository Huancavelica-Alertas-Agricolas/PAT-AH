// Comentarios añadidos en español: servicio SMS compartido.
// Envía códigos de verificación y alertas por SMS usando Twilio (si está configurado).

/**
 * SMS Service using Twilio
 * Envía códigos de verificación y notificaciones por SMS
 */

const twilio = require('twilio');

class SMSService {
  constructor() {
    this.client = null;
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER;
    
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    }
  }

  /**
   * Envía un código de verificación por SMS
   * @param {string} phone - Número de teléfono en formato +51XXXXXXXXX
   * @param {string} code - Código de verificación de 6 dígitos
   * @returns {Promise<boolean>}
   */
  async sendVerificationCode(phone, code) {
    if (!this.client) {
      console.warn('Twilio not configured. Would send code:', code, 'to:', phone);
      return true; // En desarrollo, simular éxito
    }

    try {
      const message = await this.client.messages.create({
        body: `Tu código de verificación para AlertaSegura es: ${code}. Válido por 10 minutos.`,
        from: this.phoneNumber,
        to: phone,
      });

      console.log('SMS sent successfully:', message.sid);
      return true;
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw new Error('No se pudo enviar el SMS');
    }
  }

  /**
   * Envía una alerta por SMS
   * @param {string} phone - Número de teléfono
   * @param {string} mensaje - Mensaje de la alerta
   * @returns {Promise<boolean>}
   */
  async sendAlert(phone, mensaje) {
    if (!this.client) {
      console.warn('Twilio not configured. Would send alert to:', phone);
      return true;
    }

    try {
      const message = await this.client.messages.create({
        body: `⚠️ AlertaSegura Huancavelica: ${mensaje}`,
        from: this.phoneNumber,
        to: phone,
      });

      console.log('Alert SMS sent:', message.sid);
      return true;
    } catch (error) {
      console.error('Error sending alert SMS:', error);
      return false;
    }
  }

  /**
   * Genera un código de verificación de 6 dígitos
   * @returns {string}
   */
  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

module.exports = new SMSService();
