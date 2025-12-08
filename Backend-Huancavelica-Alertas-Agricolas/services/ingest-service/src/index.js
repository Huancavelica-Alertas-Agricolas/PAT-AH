#!/usr/bin/env node
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://18.208.193.82:5173',
    'http://pat-ah-frontend-876253813400-b67b5fbe.s3-website-us-east-1.amazonaws.com',
    'https://d3juc86eqmpfpd.cloudfront.net',
    'https://pat-ah-frontend.onrender.com'
  ],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));

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
