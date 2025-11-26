// Wrapper: re-export the compiled TypeScript implementation from `dist`.
// This allows runtime requires of './senamhi-reader' to work while the
// real implementation is written in TypeScript and compiled to `dist`.
module.exports = require('../dist/senamhi-reader.js');
