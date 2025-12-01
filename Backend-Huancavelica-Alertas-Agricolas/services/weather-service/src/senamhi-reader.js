// Comentarios añadidos en español: wrapper que re-exporta el módulo compilado `dist/senamhi-reader.js`.
// Propósito: mantener compatibilidad `require('./senamhi-reader')` sin modificar el código compilado.
module.exports = require('../dist/senamhi-reader.js');
