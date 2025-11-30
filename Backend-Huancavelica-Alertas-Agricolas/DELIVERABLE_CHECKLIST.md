# Checklist de Entregables — Backend (Huancavelica Alertas Agrícolas)

Este documento lista pasos concretos y comandos de ejemplo para cubrir los criterios de evaluación: pruebas, seguridad, despliegue, monitoreo, mantenimiento, construcción del producto y sustentación oral.

---

## 1) Pruebas de Software y Seguridad

- **Objetivo**: demostrar integración de pruebas (unitarias, integración, smoke) y pruebas de seguridad con reportes.

- ¿Qué entregar?
  - Evidencia de ejecución de tests (salida de CI, cobertura).\
  - Reporte de pruebas de seguridad (escaneo de dependencias y escaneo de imágenes / contenedores).\
  - Observaciones levantadas y acciones (lista o issues).

- Ejemplos de comandos (desde la raíz del backend):

```pwsh
# Ejecutar tests de un servicio (PowerShell)
npm --prefix services/rest-service test

# Ejecutar con cobertura
npm --prefix services/rest-service run test:cov
```

- Añadir en CI (GitHub Actions) un job que haga al menos:
  - `npm ci` por servicio
  - `npm test -- --coverage`
  - `npm audit` o `npm audit --json` (guardar artefacto)
  - `trivy image` o `snyk test` para escanear imágenes/deps

Ejemplo breve de step en GH Actions:

```yaml
- name: Run tests & audit
  run: |
    cd Backend-Huancavelica-Alertas-Agricolas/services/rest-service
    npm ci
    npm test -- --coverage
    npm audit --json > ../../artifacts/npm-audit.json || true
```

Para escaneo de contenedores (local):

```pwsh
# instalar trivy y escanear imagen construida
# trivy image --format json -q myimage:latest > trivy-report.json
```

---

## 2) Pruebas de Seguridad (Taller de Pruebas de Seguridad)

- Incluir al menos:
  - `npm audit` + análisis de resultados y plan de mitigación.
  - Escaneo de imágenes con `trivy` o `clair` en CI.
  - (Opcional) pruebas dinámicas contra endpoints con OWASP ZAP o ZAP baseline.

- Entregables: `security-report.json`, lista de observaciones (issue links), evidencia de remediaciones si las hay.

---

## 3) Despliegue del proyecto

- Evidencia mínima: `Dockerfile` por servicio, `docker-compose.yml`, y documentación con comandos de despliegue.
- Si la evaluación exige específicamente Java/Maven, documentar la diferencia tecnológica (este backend es Node/NestJS) o incluir un micro módulo Java con `pom.xml` que demuestre pipeline Maven.

- Ejemplo de pasos para CI/CD (build → push → deploy):

```pwsh
# Build local con docker-compose
docker compose build --pull
docker compose up -d

# Build y test en CI: construir imagen, ejecutar tests en contenedor, push a registry
```

---

## 4) Monitoreo (6 pts)

- Implementar y documentar:
  - Endpoint `/health` (liveness/readiness) por servicio.
  - Endpoint `/metrics` (Prometheus) o exportador que exponga métricas.
  - Logging estructurado (ej.: `winston` o `pino`) y correlación de requests.

- Ejemplo rápido de verificación local:

```pwsh
Invoke-WebRequest http://localhost:3003/health
Invoke-WebRequest http://localhost:9410/metrics
```

- Entregable: `monitoring-plan.md` con targets de Prometheus y posibles dashboards/alertas (ej. reglas básicas para `instance_down`, `high_error_rate`).

---

## 5) Mantenimiento (5 pts)

- Incluir scripts y políticas de backup/restore:

- Script de backup de Postgres (ejemplo `scripts/backup_postgres.sh`):

```bash
#!/bin/sh
PGHOST=db
PGUSER=pat
PGDATABASE=pat_ah
PGPASSWORD=pat
OUT=/backups/pat_ah_$(date +%F_%H%M).sql
pg_dump -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -F c -f "$OUT"
```

- Ejemplo de cron (Linux) para correr backup diario a las 02:30:

```cron
30 2 * * * /usr/local/bin/backup_postgres.sh >> /var/log/backup_postgres.log 2>&1
```

- Entregable: script de backup, README con procedimiento de restore y verificación de integridad.

---

## 6) Construcción del producto final (3 pts)

- Checklist a validar:
  - ¿Cubre el alcance comprometido? (Documentar endpoints implementados vs alcance).\
  - ¿Documentación y código alineados? (links en `README.md` y docs por servicio).\
  - ¿Buenas prácticas? (uso de linters, dependencias justificadas, tests).\
  - ¿Autoría demostrable? (commits, explicación en la sustentación).

Recomendación: añadir `CONTRIBUTING.md` con cómo ejecutar localmente y quién hizo qué.

---

## 7) Sustentación oral (2 pts)

- Preparar una demo con agenda clara (max 8-12 minutos):
  1. Objetivo del backend y arquitectura en 1-2 diapositivas.\
  2. Mostrar endpoints clave y flow (registro de usuario → alertas).\
  3. Ejecutar pruebas en vivo (ej.: `npm test` o `scripts/run_service_tests.ps1`).\
  4. Mostrar health/metrics/logs.\
  5. Responder preguntas técnicas (seguridad, monitoreo, mantenimiento).

- Comandos de demo sugeridos (PowerShell):

```pwsh
# Levantar servicios (local)
docker compose up -d --build

# Ejecutar smoke tests orquestados
pwsh .\scripts\run_service_tests.ps1

# Mostrar logs del servicio rest
docker compose logs --tail 200 rest-service

# Consultar health
Invoke-WebRequest http://localhost:3003/health
```

- Evidencias a mostrar: salida de tests (OK), screenshots de `trivy/npm audit` (si los agregas), logs y métricas.

---

## 8) Entregables mínimos sugeridos (archivos a añadir al repo)

- `Backend-Huancavelica-Alertas-Agricolas/.github/workflows/ci.yml` → corre `lint`, `tests`, `npm audit`, `trivy`.
- `services/*/test` → cubrir al menos smoke + casos críticos (ya existen algunos).\
- `scripts/backup_postgres.sh` y `scripts/restore_postgres.sh`.
- `monitoring/` → ejemplo de `prometheus.yml` con `scrape_configs` para `metrics` endpoints.
- `security/security-report-YYYYMMDD.md` o `json` output from trivy/npm-audit.

---

## Próximos pasos (elige una opción)

- **B)** Generar ejemplo de `ci.yml` (GitHub Actions) que incluya tests, cobertura y trivy.
- **C)** Crear `scripts/backup_postgres.sh` y `monitoring/prometheus.yml` de ejemplo.

Indica si prefieres **B** o **C** y lo implemento.
