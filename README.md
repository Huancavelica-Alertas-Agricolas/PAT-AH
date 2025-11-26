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
  cd 'A:\PAT-AH-repopersonal\PAT-AH\Backend-Huancavelica-Alertas-Agricolas'
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
