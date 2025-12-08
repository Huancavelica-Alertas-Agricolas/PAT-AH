# Guía de Despliegue en Render - PAT-AH

Esta guía explica cómo desplegar los microservicios del backend y el frontend en Render manualmente (como Web Services).

## Base de Datos
- Ya creada en Render: `bd_pat_ah`
- Connection String: `postgresql://bd_pat_ah_user:d2zf7ADO3LIBeH6HHE0WnkuyNoIHp01A@dpg-d4q9m7q4i8rc73flvhjg-a.virginia-postgres.render.com:5432/bd_pat_ah?sslmode=require`
- Tablas creadas con `schema_to_sql.sql`.

## Despliegue de Microservicios (Backend)

### Configuración General para Cada Servicio:
- Repo: `Huancavelica-Alertas-Agricolas/PAT-AH`
- Branch: `main`
- Runtime: Docker
- Dockerfile Path: `Backend-Huancavelica-Alertas-Agricolas/services/[service-name]/Dockerfile` (ej. para auth: `Backend-Huancavelica-Alertas-Agricolas/services/auth-service/Dockerfile`)
- Root Directory: **Deja vacío** (el Dockerfile asume contexto del repo root)
- Environment Variables:
  NODE_ENV=production
  DATABASE_URL=postgresql://bd_pat_ah_user:d2zf7ADO3LIBeH6HHE0WnkuyNoIHp01A@dpg-d4q9m7q4i8rc73flvhjg-a.virginia-postgres.render.com:5432/bd_pat_ah?sslmode=require
  JWT_SECRET=c3f9c6b7d5b448606e1cb73057ae240a
- Health Check Path: `/healthz`
- Plan: Starter (o Standard para ai-service)

### Servicios a Desplegar:

1. **auth-service**
   - Name: `PAT-AH-auth`
   - Dockerfile Path: `Backend-Huancavelica-Alertas-Agricolas/services/auth-service/Dockerfile`
   - Port: 3001

2. **users-service**
   - Name: `PAT-AH-users`
   - Dockerfile Path: `Backend-Huancavelica-Alertas-Agricolas/services/users-service/Dockerfile`
   - Port: 3002

3. **rest-service**
   - Name: `PAT-AH-rest`
   - Dockerfile Path: `Backend-Huancavelica-Alertas-Agricolas/services/rest-service/Dockerfile`
   - Port: 3003

4. **ai-service**
   - Name: `PAT-AH-ai`
   - Dockerfile Path: `Backend-Huancavelica-Alertas-Agricolas/services/ai-service/Dockerfile`
   - Port: 3004
   - Plan: Standard (más RAM para IA)

5. **ingest-service**
   - Name: `PAT-AH-ingest`
   - Dockerfile Path: `Backend-Huancavelica-Alertas-Agricolas/services/ingest-service/Dockerfile`
   - Port: 3005

## Despliegue de Frontend

- Type: Static Site
- Name: `PAT-AH-frontend`
- Repo: `Huancavelica-Alertas-Agricolas/PAT-AH`
- Branch: `main`
- Root Directory: **Deja vacío**
- Build Command: `cd Frontend-Huancavelica-Alertas-Agricolas && npm run build`
- Publish Directory: `Frontend-Huancavelica-Alertas-Agricolas/dist`
- Environment Variables (para conectar con backends):
  - VITE_GRAPHQL_URL= https://pat-ah-rest.onrender.com/api/graphql (GraphQL endpoint del rest-service)
  - VITE_AUTH_SERVICE_URL= https://pat-ah-ha95.onrender.com (auth-service)
  - VITE_USERS_SERVICE_URL= https://pat-ah-users-service.onrender.com (users-service)
  - VITE_AI_SERVICE_URL= https://pat-ah-ai.onrender.com (ai-service)
  - VITE_INGEST_SERVICE_URL= https://pat-ah-ingest.onrender.com (ingest-service)

### URLs de Servicios Desplegados:
- auth-service: https://pat-ah-ha95.onrender.com
- users-service: https://pat-ah-users-service.onrender.com
- rest-service: https://pat-ah-rest.onrender.com
- ai-service: https://pat-ah-ai.onrender.com
- ingest-service: https://pat-ah-ingest.onrender.com

## Pasos en Render:
1. Ve a Dashboard > New > Web Service (para backend) o Static Site (para frontend).
2. Conecta el repo y configura según arriba.
3. Despliega y verifica logs.
4. Para el frontend, configura las Environment Variables con las URLs de los servicios desplegados (ver arriba).

## n8n (Workflows)
- Usa n8n Cloud gratis (100 ejecuciones/mes).
- Importa `n8n_workflows/alert-workflow.json`.
- Configura credenciales: Twilio, SMTP, Telegram, DB de Render.

¡Listo para desplegar!</content>
<parameter name="filePath">c:\Users\aldai\Downloads\proyectos\PAT-AH\README_DEPLOY.md