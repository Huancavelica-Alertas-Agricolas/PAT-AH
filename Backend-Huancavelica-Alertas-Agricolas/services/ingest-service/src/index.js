#!/usr/bin/env node
// Comentarios añadidos en español: script de entrada del ingest-service que lista comandos disponibles.
console.log('ingest-service entrypoint. Available commands:');
console.log('  npm run preprocess   -> runs src/preprocess_and_train.js');
console.log('  node src/convert_csv_to_xlsx.js');
console.log('  node src/run_train_request.js');
