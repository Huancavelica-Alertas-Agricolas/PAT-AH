// Comentarios añadidos en español: logger configurado para `alert-service`.
// Provee un logger JSON con timestamp y manejo de errores usando `winston`.
const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'alert-service' },
  transports: [
    new transports.Console(),
  ],
});

module.exports = logger;