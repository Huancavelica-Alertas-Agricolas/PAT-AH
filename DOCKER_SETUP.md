# 🐳 Despliegue con Docker - AlertaSegura Huancavelica

## 📋 Requisitos Previos

- **Docker Desktop** instalado y corriendo
- **Docker Compose** (incluido con Docker Desktop)
- **Git** (opcional, para clonar el repositorio)

## 🚀 Inicio Rápido

### 1. Clonar el repositorio (si aún no lo tienes)
```bash
git clone <tu-repositorio>
cd Backend-Huancavelica-Alertas-Agricolas
```

### 2. Crear archivo de variables de entorno (opcional)
```bash
cp .env.example .env
```

Si tienes credenciales de Twilio y OpenWeatherMap, edita el archivo `.env`:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
OPENWEATHER_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Nota:** Si no configuras estas variables, el sistema funcionará en modo mock (sin SMS reales ni datos meteorológicos reales).

### 3. Levantar todos los servicios
```bash
docker-compose up --build
```

O en segundo plano:
```bash
docker-compose up -d --build
```

### 4. Esperar a que los servicios estén listos

El sistema se despliega en este orden:
1. **PostgreSQL** (puerto 5432) - Base de datos
2. **Backend** (puerto 3003) - API GraphQL + WebSocket
3. **Frontend** (puerto 5173) - Aplicación React

Cuando veas en los logs:
```
alertas-backend  | [Nest] 1  - 12/01/2025, 12:00:00 AM     LOG [NestApplication] Nest application successfully started
alertas-frontend | VITE v5.4.21  ready in 1495 ms
```

¡El sistema está listo! 🎉

## 🌐 Acceso a los Servicios

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:5173 | Aplicación web React |
| **Backend API** | http://localhost:3003/api/graphql | GraphQL Playground |
| **WebSocket** | ws://localhost:3003/api/graphql | Subscriptions en tiempo real |
| **PostgreSQL** | localhost:5432 | Base de datos |

## 📊 Usuarios de Prueba (Seed Data)

El sistema crea automáticamente 5 usuarios de prueba:

| Email | Password | Rol | Zona |
|-------|----------|-----|------|
| admin@huancavelica.gob.pe | admin123 | admin | Huancavelica Centro |
| agricultor1@test.com | password123 | agricultor | Acobamba |
| agricultor2@test.com | password123 | agricultor | Tayacaja |
| tecnico@test.com | password123 | tecnico | Churcampa |
| observador@test.com | password123 | observador | Castrovirreyna |

## 🛠️ Comandos Útiles

### Ver logs en tiempo real
```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo frontend
docker-compose logs -f frontend

# Solo base de datos
docker-compose logs -f postgres
```

### Detener los servicios
```bash
docker-compose down
```

### Detener y eliminar volúmenes (resetear base de datos)
```bash
docker-compose down -v
```

### Reiniciar un servicio específico
```bash
docker-compose restart backend
docker-compose restart frontend
```

### Ejecutar comandos dentro de un contenedor

**Backend:**
```bash
# Entrar al contenedor
docker-compose exec backend sh

# Ejecutar migraciones de Prisma
docker-compose exec backend sh -c "cd services/shared/prisma && npx prisma migrate dev"

# Ver schema de la base de datos
docker-compose exec backend sh -c "cd services/shared/prisma && npx prisma studio"
```

**PostgreSQL:**
```bash
# Conectar a la base de datos
docker-compose exec postgres psql -U postgres -d alertas_agricolas

# Ver tablas
\dt

# Salir
\q
```

## 🧪 Probar el Sistema

### 1. Registro de Usuario
1. Abrir http://localhost:5173
2. Click en "Crear cuenta"
3. Llenar el formulario:
   - Nombre: Test User
   - Email: test@example.com
   - Teléfono: +51987654321
   - Zona: Huancavelica Centro
   - Password: password123
4. Click "Crear Cuenta"
5. ✅ Debes ser redirigido al dashboard

### 2. Login
1. Email: admin@huancavelica.gob.pe
2. Password: admin123
3. ✅ Acceso al sistema

### 3. Crear Alerta (desde GraphQL Playground)
1. Abrir http://localhost:3003/api/graphql
2. Ejecutar mutation:
```graphql
mutation {
  createAlert(
    input: {
      title: "Helada intensa esta noche"
      description: "Se esperan temperaturas de -5°C"
      type: "helada"
      severity: "alta"
      zone: "Huancavelica Centro"
      location: "Plaza de Armas"
    }
    userId: "USER_ID_AQUI"
  ) {
    id
    title
    severity
  }
}
```

### 4. Verificar WebSocket en Tiempo Real
1. En el frontend (http://localhost:5173), iniciar sesión
2. En otra pestaña, crear una alerta desde GraphQL Playground
3. ✅ Debes ver la notificación aparecer INSTANTÁNEAMENTE en el frontend

## 🔧 Solución de Problemas

### Error: "Cannot connect to Docker daemon"
```bash
# Asegúrate de que Docker Desktop esté corriendo
# En Windows, verifica que Docker Desktop esté iniciado
```

### Error: "Port 5432 is already in use"
```bash
# Detener PostgreSQL local si está corriendo
# Opción 1: Cambiar el puerto en docker-compose.yml
ports:
  - "5433:5432"  # Usar 5433 en lugar de 5432

# Opción 2: Detener PostgreSQL local
# Windows: Services → PostgreSQL → Stop
```

### Error: "Port 3003 is already in use"
```bash
# Buscar y detener procesos en ese puerto
# Windows PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 3003).OwningProcess | Stop-Process -Force
```

### Backend no se conecta a PostgreSQL
```bash
# Verificar que PostgreSQL esté healthy
docker-compose ps

# Reiniciar servicios
docker-compose restart postgres
docker-compose restart backend
```

### Frontend no carga
```bash
# Reconstruir el contenedor
docker-compose up -d --build frontend

# Ver logs
docker-compose logs -f frontend
```

### Resetear todo (empezar de cero)
```bash
# Detener todo
docker-compose down -v

# Eliminar imágenes
docker-compose down --rmi all -v

# Reconstruir todo
docker-compose up --build
```

## 📦 Estructura de Contenedores

```
┌─────────────────────────────────────────┐
│         Docker Network (alertas)        │
│                                         │
│  ┌─────────────┐   ┌─────────────┐     │
│  │  PostgreSQL │◄──┤   Backend   │     │
│  │  (postgres) │   │  (NestJS)   │     │
│  │   Port 5432 │   │  Port 3003  │     │
│  └─────────────┘   └──────▲──────┘     │
│                            │            │
│                     ┌──────┴──────┐     │
│                     │  Frontend   │     │
│                     │   (React)   │     │
│                     │  Port 5173  │     │
│                     └─────────────┘     │
└─────────────────────────────────────────┘
```

## 🎯 Ventajas de Docker

✅ **No más "funciona en mi máquina"** - Todos tienen el mismo entorno
✅ **PostgreSQL incluido** - No necesitas instalarlo localmente
✅ **Dependencias aisladas** - No conflictos con otros proyectos
✅ **Fácil de resetear** - `docker-compose down -v` y empieza de cero
✅ **Seed automático** - 5 usuarios y datos de prueba creados al iniciar
✅ **Hot reload** - Los cambios en el código se reflejan automáticamente

## 🚀 Próximos Pasos

1. ✅ Levantar sistema con Docker
2. ✅ Probar registro y login
3. ✅ Verificar WebSocket funcionando
4. 🔄 Agregar más datos de prueba
5. 🔄 Personalizar para producción
6. 🔄 Desplegar en AWS/Azure

## 📝 Notas Importantes

- Los datos se persisten en un volumen de Docker (`postgres_data`)
- Para resetear la base de datos: `docker-compose down -v`
- El backend ejecuta `prisma db push` y `prisma db seed` automáticamente
- El frontend está en modo desarrollo (hot reload habilitado)
- Los logs se pueden ver con `docker-compose logs -f`

## 🆘 Soporte

Si encuentras algún problema:
1. Revisar logs: `docker-compose logs -f`
2. Verificar estado: `docker-compose ps`
3. Resetear: `docker-compose down -v && docker-compose up --build`
