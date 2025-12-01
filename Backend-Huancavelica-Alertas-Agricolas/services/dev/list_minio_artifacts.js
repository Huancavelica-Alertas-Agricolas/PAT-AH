#!/usr/bin/env node
// Comentarios añadidos en español: script de ayuda para listar artefactos en MinIO/S3 por runId.
// Uso: `node list_minio_artifacts.js <runId> [bucket] [prefix]`.
// Comprueba presencia de `model.json`, `weights.bin`, y `<modelId>_files.json`.
// Requiere el paquete `@aws-sdk/client-s3` y credenciales/endpoint en variables de entorno.
// No modifica artefactos; solo lista y verifica existencia.

const { S3Client, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');
const process = require('process');

async function main() {
  const runId = process.argv[2];
  if (!runId) {
    console.error('Uso: node list_minio_artifacts.js <runId> [bucket] [prefix]');
    process.exit(2);
  }
  const bucket = process.argv[3] || process.env.S3_BUCKET || 'mlflow';
  const prefixBase = process.argv[4] || `${runId}/artifacts`;

  const endpoint = process.env.S3_ENDPOINT || 'http://localhost:9000';
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID || 'minio';
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || 'minio123';

  const s3 = new S3Client({ endpoint, region: 'us-east-1', credentials: { accessKeyId, secretAccessKey }, forcePathStyle: true });

  console.log(`Verificando objetos en s3://${bucket}/${prefixBase}/`);

  try {
    const objects = [];
    let continuationToken = undefined;
    do {
      const res = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefixBase + '/', ContinuationToken: continuationToken }));
      if (res.Contents) {
        for (const o of res.Contents) objects.push(o.Key);
      }
      continuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
    } while (continuationToken);

    if (objects.length === 0) {
      console.log('No se encontraron objetos para ese run/prefijo. Verifica bucket/endpoint/credenciales.');
      process.exit(0);
    }

    console.log(`Encontrados ${objects.length} objetos (mostrando hasta 200):`);
    console.log(objects.slice(0, 200).join('\n'));

    // Comprobar archivos esperados
    const modelJsonKey = objects.find(k => k.endsWith('model.json'));
    const weightsKey = objects.find(k => k.endsWith('weights.bin') || k.endsWith('.bin'));
    const markerKey = objects.find(k => k.endsWith('_files.json'));

    console.log('\nComprobación de archivos:');
    console.log(`- model.json: ${modelJsonKey ? 'ENCONTRADO -> ' + modelJsonKey : 'NO ENCONTRADO'}`);
    console.log(`- weights.bin: ${weightsKey ? 'ENCONTRADO -> ' + weightsKey : 'NO ENCONTRADO'}`);
    console.log(`- <modelId>_files.json: ${markerKey ? 'ENCONTRADO -> ' + markerKey : 'NO ENCONTRADO'}`);

  } catch (err) {
    console.error('Error listando objetos en S3/MinIO:', err.message || err);
    process.exit(1);
  }
}

main();
