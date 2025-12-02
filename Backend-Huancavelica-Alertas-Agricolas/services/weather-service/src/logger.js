// Logger configurado con winston para el weather-service. Comentarios en español.
const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'weather-service' },
  transports: [
    new transports.Console(),
  ],
});

module.exports = logger;
