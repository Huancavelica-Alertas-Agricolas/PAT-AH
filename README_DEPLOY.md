# Guía de Despliegue en Render - PAT-AH

Esta guía explica cómo desplegar los microservicios del backend y el frontend en Render usando render.yaml (despliegue automatizado).

## 🚀 Despliegue Automático con render.yaml

### Paso 1: Crear Nueva Base de Datos PostgreSQL
1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Crea una nueva **Managed PostgreSQL** database:
   - Name: `pat-ah-db` (o el nombre que prefieras)
   - Plan: Starter (gratuito)
   - Region: Oregon (US West)
3. **IMPORTANTE:** Copia la **Internal Database URL** para usarla después

### Paso 2: Desplegar con render.yaml
1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Click en **"New"** → **"Blueprint"**
3. Conecta tu repositorio: `Huancavelica-Alertas-Agricolas/PAT-AH`
4. Branch: `main`
5. Archivo: `Backend-Huancavelica-Alertas-Agricolas/render.yaml`
6. **Configura las variables de entorno:**
   - `JWT_SECRET`: Genera uno nuevo (ej: `openssl rand -hex 32`)
   - `TWILIO_ACCOUNT_SID`: Tu SID de Twilio (opcional)
   - `TWILIO_AUTH_TOKEN`: Tu token de Twilio (opcional)
   - `TWILIO_PHONE_NUMBER`: Tu número de Twilio (opcional)
   - `OPENWEATHER_API_KEY`: Tu API key de OpenWeatherMap (opcional)

### Paso 3: Aplicar Migraciones de Base de Datos
Después del despliegue, ejecuta las migraciones:

```bash
# Conectar a la base de datos y ejecutar:
npx prisma@5.22.0 migrate deploy --schema=services/shared/prisma/schema.prisma
```

## 📋 Servicios Desplegados

### Backend Services:
- **PAT-AH-auth**: `https://[name]-auth.onrender.com` (puerto 3001)
- **PAT-AH-users**: `https://[name]-users.onrender.com` (puerto 3002)
- **PAT-AH-rest**: `https://[name]-rest.onrender.com` (puerto 3003)
- **PAT-AH-ai**: `https://[name]-ai.onrender.com` (puerto 3004)
- **PAT-AH-ingest**: `https://[name]-ingest.onrender.com` (puerto 3005)

### Base de Datos y Admin:
- **pat-ah-db**: Base de datos PostgreSQL
- **PAT-AH-adminer**: `https://[name]-adminer.onrender.com` (Adminer para gestión BD)

### Job:
- **pat-ah-prisma-migrate**: Aplica migraciones automáticamente

## 🎨 Despliegue del Frontend

### Opción 1: Usando Render (Recomendado)
1. Ve a Render Dashboard
2. **New** → **Static Site**
3. Conecta el repo: `Huancavelica-Alertas-Agricolas/PAT-AH`
4. Branch: `main`
5. Build Command: `npm run build`
6. Publish Directory: `Frontend-Huancavelica-Alertas-Agricolas/dist`
7. **Environment Variables:**
   ```
   VITE_GRAPHQL_URL=https://[tu-app-rest].onrender.com/api/graphql
   VITE_GRAPHQL_WS_URL=wss://[tu-app-rest].onrender.com/api/graphql
   VITE_USE_MOCK=false
   ```

### Opción 2: Build Local y Deploy Manual
```bash
cd Frontend-Huancavelica-Alertas-Agricolas
npm install
npm run build
# Subir el contenido de la carpeta `dist` a cualquier hosting estático
```

## 🔧 Configuración Post-Despliegue

### 1. Verificar Conexiones
- Accede a Adminer y verifica que las tablas existen
- Prueba el endpoint GraphQL: `https://[tu-app-rest].onrender.com/api/graphql`

### 2. Configurar N8N (Opcional)
Si usas N8N para workflows:
- Webhook URL: `https://[tu-app-rest].onrender.com/api/webhook/clima-alerta`
- Configura las credenciales de Twilio, SMTP, etc.

### 3. Variables de Entorno Adicionales
```
# Para Twilio (SMS)
TWILIO_ACCOUNT_SID=tu_sid
TWILIO_AUTH_TOKEN=tu_token
TWILIO_PHONE_NUMBER=+1234567890

# Para Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_app_password

# Para OpenWeatherMap
OPENWEATHER_API_KEY=tu_api_key
```

## 🐛 Troubleshooting

### Problema: Servicios no inician
- Verifica que la base de datos esté creada y accesible
- Revisa los logs en Render Dashboard
- Asegúrate de que las variables de entorno estén configuradas

### Problema: Frontend no conecta al backend
- Verifica las URLs en las variables de entorno del frontend
- Asegúrate de que los servicios backend estén ejecutándose
- Revisa la consola del navegador para errores de CORS

### Problema: Migraciones fallan
```bash
# Ejecutar manualmente:
npx prisma@5.22.0 migrate deploy --schema=services/shared/prisma/schema.prisma
```

## 📊 Monitoreo

- **Health Checks**: Cada servicio tiene `/healthz`
- **Logs**: Disponibles en Render Dashboard
- **Base de Datos**: Accesible via Adminer
- **Métricas**: Disponibles en Render Dashboard

---

**Nota**: Esta configuración usa la nueva base de datos. La configuración anterior con `bd_pat_ah` ya no es válida.
   - Port: 3005

## Despliegue de Frontend

- Type: Static Site
- Name: `PAT-AH-frontend`
- Repo: `Huancavelica-Alertas-Agricolas/PAT-AH`
- Branch: `main`
- Root Directory: `Frontend-Huancavelica-Alertas-Agricolas`
- Build Command: `npm run build` (por defecto)
- Publish Directory: `dist`
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