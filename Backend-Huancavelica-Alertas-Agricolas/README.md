# Backend — Huancavelica Alertas Agrícolas

Guía de buenas prácticas, configuración y comandos para el backend (microservicios Node/NestJS + Prisma + Docker Compose).

## Resumen
- Arquitectura: varios microservicios (rest-service gateway, weather-service, auth-service, users-service, alert-service, etc.) comunicándose por HTTP y TCP (microservices transport).
- DB: PostgreSQL (contenedor). ORM/Client: Prisma.

## Requisitos locales
- Docker & Docker Compose
- Node.js LTS (para desarrollo local fuera de contenedores)
- npm / yarn
- psql (opcional, para consultas ad-hoc)

## Variables de entorno críticas
- `DATABASE_URL` — string de conexión Postgres (p. ej. `postgres://pat:pat@db:5432/pat_ah`).
- `WEATHER_HOST`, `WEATHER_PORT` — usados por `rest-service` para alcanzar `weather-service` cuando se corre con compose.
- `JWT_SECRET` — secreto para firmar tokens.
- `PORT` — puerto de cada servicio (por defecto definido en cada `Dockerfile`/`main.js`).

## Comandos comunes (desde la raíz del repo)
- Levantar entorno completo (DB + servicios):
  - `docker compose up -d --build`
- Levantar servicio específico (reconstruir):
  - `docker compose up -d --build rest-service weather-service`
- Ver logs:
  - `docker compose logs --tail 200 rest-service`
- Ejecutar tests (según servicio):
  - `npm --prefix services/rest-service test`

## Buenas prácticas de código
- Modularizar: cada microservicio con responsabilidad única y API bien documentada.
- Definir contratos: mantener documentación OpenAPI/Swagger o ejemplos de payloads para los endpoints y mensajes microservice.
- Manejar errores en boundary: retornar objetos de error claros y códigos HTTP adecuados.
- Validación: usar DTOs y pipes de NestJS (`ValidationPipe`) para validar inputs.
- Timeouts y reintentos en comunicación entre microservicios.

## Dependencias y producción
- Mantener `package.json` lean: declarar dependencias necesarias. Para runtime en contenedores, asegurar que `node_modules` se empaqueten o se instalen durante build.
- Evitar instalar dependencias de dev en producción. Usar etapas multi-stage en Dockerfile.

## Seguridad
- No exponer variables secretas en repositorios.
- Usar `HttpOnly` cookies para tokens cuando sea posible.
- Configurar CORS en `rest-service` para orígenes permitidos.

## Observabilidad
- Añadir logs estructurados (p. ej. `pino`, `winston`) y correlación de requests.
- Exponer métricas (Prometheus) y traces (OpenTelemetry) según necesidad.

## Docker / Compose
- Versionado: mantener `docker-compose.yml` y documentar puertos mapeados.
- Dependencias `depends_on` y healthchecks para asegurar orden de arranque.
- No mantener archivos grandes o modelos binarios en imágenes; usar volúmenes o almacenamiento externo.

## CI / CD
- Ejecutar lint, tests e integridad del esquema DB (migrations) en CI.
- Automatizar build/push de imágenes y despliegue (staging → production).

## Troubleshooting frecuente
- `MODULE_NOT_FOUND` al arrancar: reconstruir imagen o añadir dependencia en `package.json` y `docker compose up --build`.
- 404 en rutas: comprobar `app.setGlobalPrefix('api')` y que el controlador esté cargado y mapeado.
- `Weather service unavailable`: verificar logs del gateway y que el microservicio TCP acepte conexiones en el puerto configurado.

## Contribuir
- Abrir issue con descripción y pasos para reproducir.
- Hacer PR con tests y manual de verificación.

---
Adaptar este README a convenciones internas y añadir esquemas/diagramas cuando sea necesario.
 **Resumen**
 Este repositorio contiene el backend del proyecto de Alertas Agrícolas para Huancavelica. La carpeta `services/` agrupa microservicios y existen artefactos relacionados con un monolito (`Dockerfile.monolith`, `README_MONOLITH.md`).

 **Estructura principal**
 - `docker-compose.yml`: composición principal para desarrollo/despliegue (verificar diferencias con `docker-compose.all.yml`).
 - `Dockerfile.monolith`: Dockerfile para versión monolítica (documentar su uso si se mantiene).
 - `services/`: cada subcarpeta es un microservicio (ej.: `ai-service`, `weather-service`, `auth-service`).
 - `scripts/`: utilidades y scripts de soporte.
 - `backups/`: (recomendado) ubicación para copias y archivos grandes (no versionar en ramas activas).

 **Recomendaciones rápidas**
 - No versionar `node_modules/`: ya se añadió `.gitignore` con `node_modules/` y archivos comunes.
 - Mover respaldos y archivos ZIP a `backups/` o almacenamiento externo fuera del repositorio activo.
 - Documentar si se trabaja con el monolito o con microservicios y cuándo usar `docker-compose.all.yml`.

 **Estructura recomendada por servicio**
 Cada carpeta `services/<service>/` debería incluir al menos:
 - `README.md` (uso y endpoints principales)
 - `package.json` o equivalente (dependencias)
 - `Dockerfile` si se containeriza
 - `src/` o `app/` con código fuente
 - `tests/` con pruebas unitarias / integradas
 - `env.example` o `config/` para configuración

 **Cómo ejecutar localmente (sugerencia)**
 1. Instalar dependencias en cada servicio (si aplica): `npm install` dentro de `services/<service>`.
 2. Levantar los servicios en modo desarrollo con `docker-compose up --build` desde la raíz del backend.

 **Buenas prácticas**
 - Mantener `backups/` fuera de la rama principal o como artefacto en un storage externo.
 - Añadir `CONTRIBUTING.md` para flujos de trabajo y estándares de commits.
 - Revisar `.github/workflows/` para CI por servicio y probar pipelines separados por microservicio cuando sea posible.

 **Contacto**
 Para cambios estructurales importantes (mover carpetas, eliminar backups), coordinar con el equipo antes de commitear.
