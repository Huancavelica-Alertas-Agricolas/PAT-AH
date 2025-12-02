// Comentarios añadidos en español: encabezado breve y uso de parámetros por método.
const { Logger } = require('@nestjs/common');

class AlertController {
  // alertService: instancia del servicio que maneja la lógica de alertas.
  constructor(alertService) {
    this.logger = new Logger(AlertController.name);
    this.alertService = alertService;
  }

  // Genera alerta climatológica. Usa: `alertRequest` = { email, userName, type }
  async generateWeatherAlert(alertRequest) {
    this.logger.log('Procesando solicitud de alerta meteorológica:', alertRequest);
    // Redirigimos este patrón al nuevo flujo que procesa una alerta ya detectada
    return await this.alertService.processClimateAlert(alertRequest);
  }

  // Genera alerta de helada. Usa: `alertRequest` = { email, userName }
  async generateFrostAlert(alertRequest) {
    this.logger.log('Procesando solicitud de alerta de helada:', alertRequest);
    return await this.alertService.generateFrostAlert(alertRequest);
  }

  // Procesa alerta enviada desde el servicio de clima. Usa: `alertData` = { tipo, descripcion, fecha }
  async processClimateAlert(alertData) {
    this.logger.log('Procesando alerta climática desde weather-service:', alertData);
    return await this.alertService.processClimateAlert(alertData);
  }

  // Obtiene alertas activas. No requiere parámetros.
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

  // Obtiene alertas de un usuario. Usa: `data.userId` = ID del usuario
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

  // Marca alerta como leída. Usa: `data.userAlertId` = ID del registro user_alert
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
