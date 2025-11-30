# PAT-AH — Huancavelica Alertas Agrícolas

Este repositorio contiene el frontend (React + Vite + TypeScript) y varios microservicios backend (Node/NestJS + Prisma + Docker Compose). Este README unificado resume buenas prácticas, configuración, comandos útiles y pasos de troubleshooting para todo el proyecto.

## Estructura principal
- `Frontend-Huancavelica-Alertas-Agricolas/` — Aplicación React (Vite, TS).
- `Backend-Huancavelica-Alertas-Agricolas/` — Microservicios: `rest-service` (gateway), `weather-service`, `auth-service`, `users-service`, `alert-service`, etc.

## Requisitos globales
- Git
- Docker & Docker Compose
- Node.js LTS (18/20/20.x)
- npm o yarn

## Variables de entorno importantes
- `DATABASE_URL` — conexión a Postgres (p. ej. `postgres://pat:pat@db:5432/pat_ah`).
- `VITE_API_URL` — URL del gateway REST para el frontend (p. ej. `http://localhost:3003/api`).
- `WEATHER_HOST`, `WEATHER_PORT` — usados por `rest-service` para alcanzar `weather-service` en docker-compose.
- `JWT_SECRET` — secreto para tokens.

Mantén un archivo `env.example` en cada servicio con las variables requeridas (no comitear `.env`).

## Comandos útiles
## Cómo correr el frontend

Recomendado: ejecutar el frontend en modo desarrollo con Vite mientras el backend corre en Docker.

- Desde la carpeta del frontend:
  - Instalar dependencias:
    - PowerShell:
      ```powershell
      cd Frontend-Huancavelica-Alertas-Agricolas
      npm install
      ```
    - bash / macOS / WSL:
      ```bash
      cd Frontend-Huancavelica-Alertas-Agricolas
      npm install
      ```
  - Ejecutar dev server (Vite):
    - PowerShell:
      ```powershell
      npm run dev
      ```
    - bash:
      ```bash
      npm run dev
      ```
  - Variables de entorno importantes antes de arrancar:
    - `VITE_API_URL` (p. ej. `http://localhost:3003/api`). Crea un archivo `.env` en la carpeta del frontend o exporta la variable localmente.

- Para construir la versión de producción:
  ```bash
  npm run build
  ```

## Cómo correr el backend (Docker Compose)

La forma recomendada en desarrollo es levantar los microservicios mediante `docker compose` desde la raíz del repo.

- Levantar todo (root):
  ```powershell
  A:\Proyecto\PAT-AH\Backend-Huancavelica-Alertas-Agricolas>
  docker compose up -d --build
  ```

- Levantar servicios específicos (ej. gateway y weather):
  ```powershell
  docker compose up -d --build rest-service weather-service
  ```

- Ver estado y puertos:
  ```powershell
  docker compose ps
  docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
  ```

- Ver logs (no interactivo):
  ```powershell
  docker compose logs --tail 200 rest-service
  ```

- Si necesitas iniciar un servicio en modo desarrollo fuera de Docker (rápido):
  ```powershell
  cd Backend-Huancavelica-Alertas-Agricolas/services/rest-service
  npm install
  npm run start
  ```
  Nota: `npm run start` ejecuta `node src/main.js` por defecto en este repo; para desarrollo es útil usar `nodemon` si lo configuras.

## Pruebas y llamadas de verificación
- Llamada HTTP desde PowerShell para verificar gateway:
  ```powershell
  Invoke-RestMethod -Method Get -Uri 'http://localhost:3003/api/weather/current' -TimeoutSec 8 | ConvertTo-Json -Depth 5
  ```

## Health endpoints y Redis local

- `notification-service` y otros microservicios exponen un endpoint de salud en `/healthz`.
- Variables relevantes para pruebas locales:
  - `REDIS_URL` (p. ej. `redis://redis:6379`) — si está configurada, el `notification-service` comprobará la cola.
  - `NOTIFICATION_QUEUE_NAME` (p. ej. `notifications`) — nombre de la lista Redis usada como cola.
  - `HEALTH_PORT` — puerto donde el servicio expone su `/healthz` (por defecto `3004` para `notification-service`).

- Levantar Redis con Docker Compose (ya incluido en `docker-compose.yml` del backend):
  ```powershell
  cd Backend-Huancavelica-Alertas-Agricolas
  docker compose up -d --build redis notification-service
  ```

- Probar `/healthz` desde PowerShell (ejemplo para `notification-service` escuchando en host `3009`):
  ```powershell
  # usando Invoke-RestMethod
  Invoke-RestMethod -Method Get -Uri 'http://localhost:3009/healthz' -TimeoutSec 5 | ConvertTo-Json -Depth 5

  # o usando curl.exe (Windows)
  curl.exe -s http://localhost:3009/healthz
  ```

- Si Redis está activo y `NOTIFICATION_QUEUE_NAME` configurado, la respuesta incluirá `components.queue` como objeto `{ "status": "ok", "len": <n> }`.

- Para probar colas manualmente:
  ```powershell
  # Añadir un mensaje a la lista notifications
  docker compose exec redis redis-cli LPUSH notifications "test-message-1"
  # Ver la longitud
  docker compose exec redis redis-cli LLEN notifications
  ```

Estas instrucciones facilitan probar la integración de la cola de notificaciones y validar los healthchecks localmente.


## Buenas prácticas (Front y Back)
- Tipado y validación:
  - Frontend: usar TypeScript estricto, evitar `any`.
  - Backend: usar DTOs y `ValidationPipe` en NestJS.
- Separación de responsabilidades:
  - Hooks/UI separados en frontend (`useAuth`, `useWeather`).
  - Microservicios con API bien definida y límites claros.
- Manejo de errores y fallbacks:
  - Mostrar mensajes de usuario claros y usar fallback demo solo cuando sea intencional.
  - Implementar timeouts y reintentos limitados en llamadas entre servicios.
- Seguridad:
  - Preferir cookies `HttpOnly` para tokens en producción.
  - No comitear secretos; usar vaults/CI secrets.
- Observabilidad:
  - Logs estructurados (p. ej. `pino`/`winston`) y correlación de requests.
  - Añadir métricas y traces si aplica (Prometheus / OpenTelemetry).
- Calidad y CI:
  - ESLint + Prettier, tests unitarios y e2e (Playwright/Cypress).
  - Pipeline: lint → tests → build → publish image.

## Troubleshooting rápido
- `MODULE_NOT_FOUND` al arrancar un contenedor:
  - Añadir la dependencia en `package.json` del servicio afectado y ejecutar `docker compose up -d --build <service>`.
- `ERR_CONNECTION_REFUSED` desde el navegador:
  - Verifica `docker ps` / `docker compose ps` y que el servicio esté `Up` y con puerto mapeado (p. ej. `0.0.0.0:3003->3003`).
- 404 en rutas que existen en código:
  - Confirma `app.setGlobalPrefix('api')` y llama con o sin `/api` según configuración; revisa logs para rutas mapeadas (`Mapped {/api/weather, GET}`).
- `Weather service unavailable`:
  - Revisar logs del gateway (`rest-service`) y del `weather-service`.
  - Verificar conectividad TCP entre contenedores (p. ej. `docker compose exec rest-service bash -c "echo > /dev/tcp/weather-service/3002"`).

## Sugerencias operativas
- Mantener `docker-compose.yml` documentado y con healthchecks para servicios dependientes.
- Mantener un `README` más detallado por servicio si su configuración es compleja (migraciones db, seeds, env específicos).
- Añadir `env.example` en cada servicio y un script `scripts/dev-up.sh` o `Makefile` para comandos comunes.

## Contribuir
- Abrir un issue describiendo el problema o la propuesta.
- Crear branch con prefijo (`feat/`, `fix/`, `chore/`) y PR con pasos para probar.

---
Si quieres, puedo añadir ahora un `env.example` en la raíz o por servicio, o generar un `docs/` con contratos (ej. OpenAPI) para las rutas del `rest-service`.

## DAST (OWASP ZAP) en CI

Hemos integrado un job DAST en el workflow de CI que ejecuta un escaneo básico con OWASP ZAP (`zap-baseline.py`) contra el `rest-service` levantado por `docker-compose.test.yml`.

- Variable configurable: `ZAP_FAIL_SEVERITIES` (por defecto: `High,Critical`).
  - En el workflow de GitHub Actions se define como `env` del job `dast` y puedes cambiarla si quieres que el job falle con severidades más bajas (por ejemplo `Medium,High,Critical`).
  - Formato: lista separada por comas, case-insensitive.

- Ejecutar localmente (ejemplo, PowerShell):
  ```powershell
  # Levantar el stack de pruebas
  cd Backend-Huancavelica-Alertas-Agricolas/services/rest-service
  docker compose -f docker-compose.test.yml up -d

  # Ejecutar ZAP desde Docker en la máquina host
  docker run --rm --network host -v ${PWD}:/zap/wrk/:rw owasp/zap2docker-stable zap-baseline.py -t http://localhost:3003 -r zap-report.html -J zap-report.json

  # Revisar resultados
  docker compose -f docker-compose.test.yml down -v
  ```

- Para cambiar el umbral en CI: edita `.github/workflows/ci.yml` y modifica la variable `ZAP_FAIL_SEVERITIES` en el job `dast`.

Si quieres que yo: (A) añada una entrada `workflow_dispatch` para ejecutar DAST manualmente desde la UI; (B) haga que el job genere un issue automático cuando encuentre alertas; o (C) use la Action `zaproxy/action-baseline` en vez del contenedor `zap2docker-stable` (más portable), dime cuál prefieres y lo implemento. (Explica entre paréntesis la utilidad y por qué.)
