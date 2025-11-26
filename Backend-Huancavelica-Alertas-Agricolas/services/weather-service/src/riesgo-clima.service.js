// Wrapper: re-export the compiled TypeScript implementation from `dist`.
// This keeps runtime require('./riesgo-clima.service') working when the
// source contains TypeScript syntax that has been compiled into `dist`.
module.exports = require('../dist/riesgo-clima.service.js');
