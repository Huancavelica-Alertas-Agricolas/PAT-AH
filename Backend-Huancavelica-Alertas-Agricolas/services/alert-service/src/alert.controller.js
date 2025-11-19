const { Logger } = require('@nestjs/common');

class AlertController {
  constructor(alertService) {
    this.logger = new Logger(AlertController.name);
    this.alertService = alertService;
  }

  async generateWeatherAlert(alertRequest) {
    this.logger.log('Procesando solicitud de alerta meteorológica:', alertRequest);
    // Redirigimos este patrón al nuevo flujo que procesa una alerta ya detectada
    return await this.alertService.processClimateAlert(alertRequest);
  }

  async generateFrostAlert(alertRequest) {
    this.logger.log('Procesando solicitud de alerta de helada:', alertRequest);
    return await this.alertService.generateFrostAlert(alertRequest);
  }

  async processClimateAlert(alertData) {
    this.logger.log('Procesando alerta climática desde weather-service:', alertData);
    return await this.alertService.processClimateAlert(alertData);
  }

  async getActiveAlerts() {
    this.logger.log('Obteniendo alertas activas');
    try {
      const alerts = await this.alertService.getActiveAlerts();
      return {
        success: true,
        message: 'Alertas activas obtenidas exitosamente',
        data: alerts
      };
    } catch (error) {
      this.logger.error('Error obteniendo alertas activas:', error);
      return {
        success: false,
        message: 'Error al obtener alertas activas',
        error: error.message
      };
    }
  }

  async getUserAlerts(data) {
    this.logger.log(`Obteniendo alertas del usuario: ${data.userId}`);
    try {
      const userAlerts = await this.alertService.getUserAlerts(data.userId);
      return {
        success: true,
        message: 'Alertas del usuario obtenidas exitosamente',
        data: userAlerts
      };
    } catch (error) {
      this.logger.error('Error obteniendo alertas del usuario:', error);
      return {
        success: false,
        message: 'Error al obtener alertas del usuario',
        error: error.message
      };
    }
  }

  async markAlertAsRead(data) {
    this.logger.log(`Marcando alerta como leída: ${data.userAlertId}`);
    try {
      const userAlert = await this.alertService.markAlertAsRead(data.userAlertId);
      return {
        success: true,
        message: 'Alerta marcada como leída exitosamente',
        data: userAlert
      };
    } catch (error) {
      this.logger.error('Error marcando alerta como leída:', error);
      return {
        success: false,
        message: 'Error al marcar alerta como leída',
        error: error.message
      };
    }
  }

  // Definición de rutas para NestJS
  static getRoutes() {
    return {
      'generate_weather_alert': 'generateWeatherAlert',
      'generate_frost_alert': 'generateFrostAlert',
      'process_climate_alert': 'processClimateAlert',
      'get_active_alerts': 'getActiveAlerts',
      'get_user_alerts': 'getUserAlerts',
      'mark_alert_read': 'markAlertAsRead'
    };
  }
}
