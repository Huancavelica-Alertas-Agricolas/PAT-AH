const axios = require('axios');
const { Injectable, Inject, Logger } = require('@nestjs/common');
const { ClientProxy } = require('@nestjs/microservices');
const { InjectRepository } = require('@nestjs/typeorm');
const { Repository } = require('typeorm');
const { firstValueFrom } = require('rxjs');
const { Alert } = require('./entities/alert.entity');
const { UserAlert } = require('./entities/user-alert.entity');

/**
 * @typedef {Object} AlertRequest
 * @property {string} email
 * @property {string} userName
 * @property {'weather' | 'frost' | 'drought'} [type]
 */

/**
 * @typedef {Object} AlertResponse
 * @property {boolean} success
 * @property {string} message
 * @property {any} [data]
 * @property {string} [error]
 */

class AlertService {
  constructor(
    weatherService,
    notificationService,
    userService,
    alertRepository,
    userAlertRepository,
  ) {
    this.logger = new Logger(AlertService.name);
    this.weatherService = weatherService;
    this.notificationService = notificationService;
    this.userService = userService;
    this.alertRepository = alertRepository;
    this.userAlertRepository = userAlertRepository;
  }

  static get dependencies() {
    return [
      { token: 'WEATHER_SERVICE', type: 'inject' },
      { token: 'NOTIFICATION_SERVICE', type: 'inject' },
      { token: 'USER_SERVICE', type: 'inject' },
      { token: 'getRepositoryToken', args: [Alert] },
      { token: 'getRepositoryToken', args: [UserAlert] }
    ];
  }

  get webhookUrl() {
    return process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/clima-alerta';
  }

  get webhookSecret() {
    return process.env.N8N_WEBHOOK_SECRET;
  }

  async postToN8n(payload) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.webhookSecret) headers['x-n8n-signature'] = this.webhookSecret;
    await axios.post(this.webhookUrl, payload, { headers });
  }

  // Nuevo flujo: procesa una alerta puntual emitida por weather-service
  async processClimateAlert(alertData) {
    this.logger.log(`Procesando alerta puntual: ${JSON.stringify(alertData)}`);
    try {
      // 1) Crear y guardar la alerta en la base de datos
      const alert = await this.createAlert({
        alert_type: alertData.tipo,
        description: alertData.descripcion,
        severity_level: this.determineSeverityLevel(alertData.tipo),
        effective_at: alertData.fecha ? new Date(alertData.fecha) : new Date(),
        expires_at: this.calculateExpirationDate(alertData.tipo),
        affected_region: {
          type: 'Point',
          coordinates: [-74.9723, -12.7861], // Huancavelica coordinates
          properties: { region: 'Huancavelica' }
        }
      });

      // 2) Obtener destinatarios del user-service
      const users = await firstValueFrom(this.userService.send('get_all_users', {}));
      
      // Filtrar solo usuarios con email válido (sin verificar recibe_alertas por ahora)
      const recipientsRaw = Array.isArray(users)
        ? users
            .filter((u) => u?.email && u.email.trim() !== '')
            .map((u) => ({
              id: u.id || u.user_id || u.userId,
              email: u.email,
              name:
                u.nombre || u.nombres || u.name ||
                `${(u.nombres || '').toString().trim()} ${(u.apellidos || u.apellido || '').toString().trim()}`.trim() ||
                'Agricultor/a',
            }))
        : [];

      // Deduplicar por email
      const uniqueMap = new Map();
      for (const r of recipientsRaw) {
        if (!uniqueMap.has(r.email) && r.id) uniqueMap.set(r.email, r);
      }
      const recipients = Array.from(uniqueMap.values());

      this.logger.log(`📧 Destinatarios encontrados: ${recipients.length}`);
      
      if (recipients.length === 0) {
        this.logger.warn('⚠️ No hay destinatarios con email válido para enviar la alerta');
      }

      // 3) Crear registros de user_alerts
      await this.assignAlertToUsers(alert.alert_id, recipients.map(r => r.id));

      const reportMessage = alertData.descripcion;
      const useN8n = (process.env.USE_N8N_FOR_EMAIL || 'false').toLowerCase() === 'true';

      if (useN8n) {
        // 2) Enviar a n8n (únicamente) si está habilitado
        const payload = {
          tipo: alertData.tipo,
          fecha: alertData.fecha || new Date().toISOString(),
          descripcion: alertData.descripcion,
          recipients: recipients.map((r) => r.email),
          severity: 'media',
          dedupeKey: `${alertData.tipo}|${new Date().toISOString().slice(0, 13)}`,
        };
        this.logger.log(`📤 Enviando a n8n: ${JSON.stringify({ tipo: payload.tipo, recipients: payload.recipients })}`);
        await this.postToN8n(payload);
      } else {
        // 2) Enviar emails usando Notification Service con plantilla
        try {
          await Promise.all(
            recipients.map((r) =>
              firstValueFrom(
                this.notificationService.send('send_email', {
                  to: r.email,
                  name: r.name,
                  reportMessage,
                }),
              ),
            ),
          );
          this.logger.log(`📧 Emails de alerta enviados via notification-service a ${recipients.length} destinatarios`);
        } catch (e) {
          this.logger.error(`❌ Error enviando emails via notification-service: ${e.message}`);
        }
      }

      // 3) Construir payload (retorno informativo)
      const payload = {
        tipo: alertData.tipo,
        fecha: alertData.fecha || new Date().toISOString(),
        descripcion: alertData.descripcion,
        recipients: recipients.map((r) => r.email),
        severity: 'media',
        dedupeKey: `${alertData.tipo}|${new Date().toISOString().slice(0, 13)}`,
      };

      return {
        success: true,
        message: useN8n ? 'Alerta enviada vía n8n' : 'Alerta enviada via notification-service',
        data: { recipients: recipients.map((r) => r.email), payload }
      };
    } catch (error) {
      this.logger.error('Error procesando alerta puntual:', error.stack);
      return {
        success: false,
        message: 'Error procesando alerta puntual',
        error: error.message
      };
    }
  }

  async generateWeatherAlert(alertRequest) {
    this.logger.log(`Generando alerta climática para: ${alertRequest.email}`);
    
    try {
      // 1. Generar el reporte de clima
      this.logger.log('Paso 1: Generando reporte meteorológico...');
      const weatherReport = await firstValueFrom(
        this.weatherService.send('generate_weather_report', {})
      );

      if (!weatherReport.success) {
        this.logger.warn('El reporte meteorológico falló:', weatherReport.message);
        return {
          success: false,
          message: 'Error al generar el reporte meteorológico',
          error: weatherReport.error || weatherReport.message,
        };
      }

      // 1.5 Crear alerta en la base de datos
      const alert = await this.createAlert({
        alert_type: alertRequest.type || 'weather',
        description: weatherReport?.message || 'Alerta meteorológica generada',
        severity_level: 'medio',
        effective_at: new Date(),
        expires_at: this.calculateExpirationDate(alertRequest.type || 'weather'),
        affected_region: {
          type: 'Point',
          coordinates: [-74.9723, -12.7861],
          properties: { region: 'Huancavelica' }
        }
      });

      // 2. Resolver destinatarios desde user-service
      this.logger.log('Paso 2: Obteniendo destinatarios desde user-service...');
      const users = await firstValueFrom(this.userService.send('get_all_users', {}));
      const recipientsRaw = Array.isArray(users)
        ? users
            .filter((u) => u?.email && (u?.recibe_alertas ?? true))
            .map((u) => ({
              id: u.id || u.user_id || u.userId,
              email: u.email,
              name:
                u.nombre || u.nombres || u.name ||
                `${(u.nombres || '').toString().trim()} ${(u.apellidos || u.apellido || '').toString().trim()}`.trim() ||
                'Agricultor/a',
            }))
        : [];
      const uniq = new Map();
      for (const r of recipientsRaw) {
        if (!uniq.has(r.email) && r.id) uniq.set(r.email, r);
      }
      const recipients = Array.from(uniq.values());

      // 2.5 Asignar alerta a usuarios
      if (recipients.length > 0) {
        await this.assignAlertToUsers(alert.alert_id, recipients.map(r => r.id));
      }

      const reportMessage = weatherReport?.message || 'Alerta meteorológica generada';
      const useN8n = (process.env.USE_N8N_FOR_EMAIL || 'false').toLowerCase() === 'true';
      const payload = {
        tipo: 'clima',
        fecha: new Date().toISOString(),
        descripcion: reportMessage,
        recipients: recipients.map((r) => r.email),
        severity: 'media',
        dedupeKey: `clima|${new Date().toISOString().slice(0, 13)}`,
      };
      if (useN8n) {
        this.logger.log(`Paso 3: Enviando payload a n8n (${recipients.length} destinatarios)...`);
        await this.postToN8n(payload);
      } else {
        this.logger.log(`Paso 3: Enviando emails via notification-service (${recipients.length})...`);
        await Promise.all(
          recipients.map((r) =>
            firstValueFrom(
              this.notificationService.send('send_email', {
                to: r.email,
                name: r.name,
                reportMessage,
              }),
            ),
          ),
        );
      }

      // 4. Éxito completo
      this.logger.log('Alerta climática generada y enviada a n8n exitosamente');
      return {
        success: true,
        message: useN8n ? 'Reporte de clima generado y enviado a n8n' : 'Reporte de clima generado y alertas enviadas via notification-service',
        data: {
          weatherReport: weatherReport.data,
          recipients: recipients.map((r) => r.email)
        }
      };

    } catch (error) {
      this.logger.error('Error en la orquestación de la alerta climática:', error.stack);
      return {
        success: false,
        message: 'Error interno al generar la alerta climática',
        error: error.message
      };
    }
  }

  async generateFrostAlert(alertRequest) {
    this.logger.log(`Generando alerta de helada para: ${alertRequest.email}`);
    
    try {
      // 1. Obtener datos meteorológicos actuales
      const weatherData = await firstValueFrom(
        this.weatherService.send('get_weather_data', {})
      );

      if (!weatherData.success) {
        return {
          success: false,
          message: 'Error al obtener datos meteorológicos',
          error: weatherData.error,
        };
      }

      // 2. Analizar riesgo de helada
      const frostRisk = weatherData.data?.some((record) => record.riesgo_helada);
      
      if (!frostRisk) {
        return {
          success: true,
          message: 'No se detectó riesgo de helada actual',
          data: { frostRisk: false }
        };
      }

      // 2.5 Crear alerta de helada en la base de datos
      const alert = await this.createAlert({
        alert_type: 'helada',
        description: 'Se ha detectado riesgo de helada en las próximas horas. Toma las medidas preventivas necesarias.',
        severity_level: 'alto',
        effective_at: new Date(),
        expires_at: this.calculateExpirationDate('helada'),
        affected_region: {
          type: 'Point',
          coordinates: [-74.9723, -12.7861],
          properties: { region: 'Huancavelica' }
        }
      });

      // 2.6 Asignar alerta al usuario específico (si tenemos su ID)
      // Por ahora, solo enviamos el email como se hacía antes

      // 3. Enviar alerta de helada
      const emailResult = await firstValueFrom(
        this.notificationService.send('send_email', {
          to: alertRequest.email,
          subject: '🧊 Alerta de Helada - Protege tus Cultivos',
          template: 'weather-alert',
          context: {
            name: alertRequest.userName,
            reportMessage: 'Se ha detectado riesgo de helada en las próximas horas. Toma las medidas preventivas necesarias.',
            date: new Date().toLocaleDateString('es-ES')
          }
        })
      );

      return {
        success: emailResult.success,
        message: emailResult.success 
          ? 'Alerta de helada enviada exitosamente' 
          : 'Error enviando alerta de helada',
        data: {
          frostRisk: true,
          weatherData: weatherData.data,
          emailSent: emailResult.success
        },
        error: emailResult.error
      };

    } catch (error) {
      this.logger.error('Error generando alerta de helada:', error.stack);
      return {
        success: false,
        message: 'Error interno al generar alerta de helada',
        error: error.message
      };
    }
  }

  // Métodos auxiliares para manejo de base de datos
  async createAlert(alertData) {
    const alert = this.alertRepository.create(alertData);
    return await this.alertRepository.save(alert);
  }

  async assignAlertToUsers(alertId, userIds) {
    const userAlerts = userIds.map(userId => 
      this.userAlertRepository.create({
        alert_id: alertId,
        user_id: userId,
        is_read: false
      })
    );
    return await this.userAlertRepository.save(userAlerts);
  }

  determineSeverityLevel(alertType) {
    const severityMap = {
      'helada': 'alto',
      'granizada': 'alto', 
      'lluvia': 'medio',
      'sequia': 'medio',
      'viento': 'bajo',
      'temperatura': 'bajo'
    };
    return severityMap[alertType] || 'medio';
  }

  calculateExpirationDate(alertType) {
    const now = new Date();
    const hoursToAdd = alertType === 'helada' ? 12 : 24; // Las heladas expiran más rápido
    return new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000);
  }

  // Métodos para consultar alertas
  async getActiveAlerts() {
    return await this.alertRepository.find({
      where: {
        expires_at: {
          $gte: new Date()
        }
      },
      relations: ['user_alerts'],
      order: {
        issued_at: 'DESC'
      }
    });
  }

  async getUserAlerts(userId) {
    return await this.userAlertRepository.find({
      where: {
        user_id: userId
      },
      relations: ['alert'],
      order: {
        received_at: 'DESC'
      }
    });
  }

  async markAlertAsRead(userAlertId) {
    const userAlert = await this.userAlertRepository.findOne({
      where: { user_alert_id: userAlertId }
    });
    
    if (userAlert) {
      userAlert.is_read = true;
      return await this.userAlertRepository.save(userAlert);
    }
    
    throw new Error('User alert not found');
  }
}

module.exports = { AlertService };
