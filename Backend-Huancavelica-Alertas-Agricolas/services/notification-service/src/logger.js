// Logger configurado con winston. Comentarios añadidos en español.
const { createLogger, format, transports } = require('winston');

// Logger principal del servicio de notificaciones.
// Nivel: 'info'. Formato: timestamp, stack de errores, soporte para sprintf, JSON.
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'notification-service' },
  transports: [
    new transports.Console(),
  ],
});

module.exports = logger;
