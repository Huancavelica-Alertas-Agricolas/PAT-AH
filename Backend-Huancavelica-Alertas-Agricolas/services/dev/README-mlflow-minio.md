# Entorno de desarrollo: Postgres + MinIO + MLflow

Este directorio contiene un `docker-compose` para levantar un entorno mínimo de desarrollo con:

- Postgres (puedes usarlo para pruebas con Prisma)
- MinIO (S3-compatible) para almacenar artifacts (modelos, pesos)
- MLflow server para tracking y model registry (artifacts en MinIO)

Archivo principal:

- `docker-compose.dev-ml.yml`

Cómo arrancar

1. Desde la raíz del repo ejecuta:

```powershell
cd services/dev
docker compose -f docker-compose.dev-ml.yml up -d
```

2. Crear el bucket `mlflow` en MinIO (usar `mc` cliente Docker):

```powershell
# Esperar algunos segundos a que MinIO esté listo
docker run --rm --network host minio/mc:latest sh -c "\
  mc alias set local http://localhost:9000 minio minio123 && \
  mc mb --ignore-existing local/mlflow && \
  mc policy set public local/mlflow || true"
```

Nota: en Windows con Docker Desktop puede que la opción `--network host` no funcione; en ese caso usa:

```powershell
docker run --rm --network "host" minio/mc:latest sh -c "mc alias set local http://host.docker.internal:9000 minio minio123 && mc mb --ignore-existing local/mlflow"
```

Endpoints útiles

- MinIO Console: http://localhost:9001  (user: `minio`, pass: `minio123`)
- MinIO API: http://localhost:9000
- MLflow UI: http://localhost:5000

Uso en la app

- Configura `MLFLOW_TRACKING_URI=http://localhost:5000` en el entorno del servicio que vaya a loggear runs.
- Para que MLflow guarde artifacts en MinIO, el contenedor `mlflow` ya tiene las variables `AWS_ACCESS_KEY_ID` y `AWS_SECRET_ACCESS_KEY` establecidas.

Problemas comunes

- Permisos/puertos ocupados: asegúrate de que los puertos 5432, 9000, 9001 y 5000 estén libres.
- Si usas WSL o Docker Desktop, para acceder desde el host a MinIO dentro de contenedor puede ser necesario usar `host.docker.internal` en lugar de `localhost`.
