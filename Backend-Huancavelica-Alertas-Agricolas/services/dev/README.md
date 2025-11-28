Dev stack: MinIO + MLflow + Postgres

Este directorio contiene utilidades para ejecutar y verificar la integración local de MLflow (tracking) y MinIO (artifact store).

Requisitos:
- Docker y Docker Compose
- Node.js (para ejecutar scripts auxiliares)

Levantar el stack:

1. Desde `Backend-Huancavelica-Alertas-Agricolas/services/dev` levantar el stack:

   docker compose -f docker-compose.dev-ml.yml up -d

Servicios expuestos en desarrollo (por defecto en el `docker-compose` incluido):
- Postgres: `localhost:5433` (usuario: `prisma`, contraseña: `prisma`, BD: `pat_ah`)
- MinIO: consola `http://localhost:9001` (credenciales `minio`/`minio123`), S3 endpoint `http://localhost:9000`
- MLflow: `http://localhost:5000` (usa MinIO como artifact store y SQLite para metadata)

Listar runs de MLflow:

PowerShell example:

   $body = @{experiment_ids=@('1'); max_results=100} | ConvertTo-Json
   Invoke-RestMethod -Uri "http://localhost:5000/api/2.0/mlflow/runs/search" -Method Post -Body $body -ContentType 'application/json'

Comprobar artifacts en MinIO para un run:

Usa el script Node incluido para listar objetos y comprobar que model.json, weights.bin y <modelId>_files.json estén presentes:

   node list_minio_artifacts.js <runId> [bucket] [prefix]

Ejemplo:

   node list_minio_artifacts.js b5f59f18f1454195949b8671c33d87f5 mlflow "1/b5f59f18f1454195949b8671c33d87f5/artifacts"

Notas sobre optimización de uploads:

- El servicio `ai-service` implementa subida de artifacts a MinIO usando `@aws-sdk/lib-storage` (Upload) que realiza multipart uploads y streaming desde archivos locales.
- Tras la subida, el servicio intentará eliminar los archivos locales del modelo para ahorrar espacio (borrado seguro con `fs.rmSync`).
- Una mejora futura es implementar un IOHandler de TFJS que escriba directamente a S3 sin crear archivos temporales locales.

Opciones siguientes:

1) Intentar arrancar el stack aquí (si Docker está disponible).
2) Ejecutar el script `list_minio_artifacts.js` contra MinIO si me das runId y acceso.
3) Crear un PR con estos cambios.
