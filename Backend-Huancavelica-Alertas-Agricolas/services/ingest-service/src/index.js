#!/usr/bin/env node
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3005;

app.get('/', (req, res) => {
  res.json({
    message: 'ingest-service entrypoint. Available commands:',
    commands: [
      'npm run preprocess   -> runs src/preprocess_and_train.js',
      'node src/convert_csv_to_xlsx.js',
      'node src/run_train_request.js'
    ]
  });
});

app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`ingest-service listening on port ${PORT}`);
});
