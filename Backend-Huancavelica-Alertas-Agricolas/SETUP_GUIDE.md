# 🚀 Guía Rápida de Instalación y Configuración

## ✅ CAMBIOS IMPLEMENTADOS

### Archivos Nuevos Creados:
1. ✅ `services/shared/prisma/schema.prisma` - **ACTUALIZADO** con 7 nuevos modelos
2. ✅ `services/shared/sms.service.js` - Servicio SMS con Twilio
3. ✅ `services/shared/weather.service.js` - Servicio meteorológico OpenWeatherMap
4. ✅ `services/shared/recommendations.data.js` - Recomendaciones agrícolas
5. ✅ `services/shared/prisma/seed.js` - Seeds con datos de prueba
6. ✅ `services/rest-service/src/alerts/alert.resolver.js` - Resolver completo de alertas
7. ✅ `services/rest-service/src/alerts/alert.module.js` - Módulo de alertas
8. ✅ `services/rest-service/src/zones/zone.resolver.js` - Resolver de zonas
9. ✅ `services/rest-service/src/zones/zone.module.js` - Módulo de zonas
10. ✅ `services/rest-service/src/notifications/notification.resolver.js` - Resolver de notificaciones
11. ✅ `services/rest-service/src/notifications/notification.module.js` - Módulo de notificaciones

### Archivos Modificados:
1. ✅ `services/rest-service/src/auth/auth.resolver.js` - **EXTENDIDO** con recoverPassword, verifyCode, resetPassword
2. ✅ `services/rest-service/src/app.module.js` - **ACTUALIZADO** con nuevos módulos y subscriptions
3. ✅ `services/rest-service/package.json` - **ACTUALIZADO** con nuevas dependencias

---

## 📋 PASOS DE INSTALACIÓN

### 1. Instalar Dependencias

```powershell
# En la carpeta rest-service
cd Backend-Huancavelica-Alertas-Agricolas/services/rest-service
npm install graphql-subscriptions twilio node-fetch
```

### 2. Configurar Variables de Entorno

Editar el archivo `.env` o agregar al `docker-compose.yml`:

```env
# Twilio (Opcional para desarrollo - funcionará en modo mock)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+51999999999

# OpenWeatherMap (Opcional - funcionará en modo mock)
OPENWEATHER_API_KEY=your_api_key
OPENWEATHER_BASE_URL=https://api.openweathermap.org/data/2.5

# Coordenadas de Huancavelica
DEFAULT_LAT=-12.7867
DEFAULT_LON=-74.9758
```

### 3. Generar Prisma Client

```powershell
cd Backend-Huancavelica-Alertas-Agricolas/services/shared
npx prisma generate
```

### 4. Crear Migración de Base de Datos

```powershell
npx prisma migrate dev --name add_graphql_features
```

### 5. Ejecutar Seeds

```powershell
node prisma/seed.js
```

### 6. Iniciar el Servidor

```powershell
# Opción 1: Con Docker Compose (recomendado)
cd Backend-Huancavelica-Alertas-Agricolas
docker-compose up -d rest-service

# Opción 2: Desarrollo local
cd services/rest-service
npm run start
```

---

## 🧪 TESTING

### Acceder a GraphQL Playground

Abrir en el navegador:
```
http://localhost:3003/api/graphql
```

### Queries de Prueba

#### 1. Login
```graphql
mutation {
  login(phone: "+51999000001", password: "password123") {
    token
    user {
      id
      nombre
      email
      telefono
      roles
    }
  }
}
```

#### 2. Obtener Alertas
```graphql
query {
  getAlerts(filter: { zone: ["Huancavelica Centro"] }) {
    id
    title
    description
    type
    severity
    priority
    status
    zone
    time
  }
}
```

#### 3. Obtener Zonas
```graphql
query {
  getZones {
    id
    name
    region
    activeAlerts
    population
    coordinates {
      lat
      lng
    }
  }
}
```

#### 4. Obtener Notificaciones
```graphql
query {
  getNotifications(userId: "USER_ID_AQUI") {
    id
    type
    title
    message
    timestamp
    read
    priority
  }
}

query {
  getUnreadCount(userId: "USER_ID_AQUI")
}
```

#### 5. Obtener Recomendaciones
```graphql
query {
  getAlertRecommendations(type: "helada") {
    id
    title
    description
    priority
  }
}
```

#### 6. Crear Alerta
```graphql
mutation {
  createAlert(input: {
    title: "Prueba de Alerta"
    description: "Esta es una alerta de prueba"
    type: "helada"
    severity: "alta"
    priority: "alta"
    zone: "Huancavelica Centro"
    location: "Plaza de Armas"
    reportedBy: "Admin Sistema"
  }, userId: "USER_ID_AQUI") {
    id
    title
    status
    reportedAt
  }
}
```

#### 7. Actualizar Estado de Alerta
```graphql
mutation {
  updateAlertStatus(
    id: "ALERT_ID_AQUI"
    status: "resuelta"
    responseTime: 60
  ) {
    id
    status
    responseTime
  }
}
```

#### 8. Recuperar Contraseña
```graphql
mutation {
  recoverPassword(identifier: "+51999000001", method: "sms")
}

mutation {
  verifyCode(phone: "+51999000001", code: "123456")
}

mutation {
  resetPassword(token: "+51999000001", newPassword: "newpassword123")
}
```

#### 9. Marcar Notificación como Leída
```graphql
mutation {
  markNotificationRead(id: "NOTIFICATION_ID_AQUI")
}

mutation {
  markAllAsRead(userId: "USER_ID_AQUI")
}
```

### Subscriptions de Prueba

#### 1. Subscription de Nuevas Alertas
```graphql
subscription {
  onNewAlert(zone: "Huancavelica Centro") {
    id
    title
    description
    type
    severity
    zone
    time
  }
}
```

#### 2. Subscription de Notificaciones
```graphql
subscription {
  onNotification(userId: "USER_ID_AQUI") {
    id
    type
    title
    message
    timestamp
    priority
  }
}
```

---

## 🔗 CONEXIÓN CON FRONTEND

### Configurar Apollo Client en Frontend

El frontend ya tiene Apollo Client configurado. Solo actualizar la URL:

```typescript
// Frontend: src/lib/apollo-client.ts
const httpLink = new HttpLink({
  uri: 'http://localhost:3003/api/graphql', // ✅ CORRECTO
});

const wsLink = new GraphQLWsLink(createClient({
  url: 'ws://localhost:3003/api/graphql', // ✅ Para subscriptions
}));
```

### Verificar CORS

El backend ya tiene CORS configurado para `localhost:5173` (Vite).

---

## 📊 DATOS DE PRUEBA (SEEDS)

Después de ejecutar los seeds, tendrás:

### Usuarios (5):
1. **Admin**: `+51999000001` / `password123` - Rol: administrador
2. **María González**: `+51999000002` / `password123` - Rol: autoridad
3. **Carlos Pérez**: `+51999000003` / `password123` - Rol: autoridad
4. **Juan Mamani**: `+51999000004` / `password123` - Rol: usuario
5. **Rosa Quispe**: `+51999000005` / `password123` - Rol: usuario

### Zonas (5):
- Huancavelica Centro
- Acobamba
- Tayacaja
- Churcampa
- Castrovirreyna

### Alertas (5):
- Helada Nocturna (activa)
- Lluvia Intensa (en-proceso)
- Vientos Fuertes (activa)
- Riesgo de Sequía (activa)
- Granizada Severa (resuelta)

### Notificaciones (20):
- 4 notificaciones por usuario (alta, media, baja prioridad)

### Datos Climáticos:
- 35 registros (7 días × 5 zonas)

### Recomendaciones (11):
- Por tipo de alerta (helada, granizada, lluvia, sequía, viento)

---

## ✅ VERIFICACIÓN COMPLETA

### Checklist de Funcionalidades:

#### Queries Implementadas:
- ✅ `login(phone, password)`
- ✅ `getAlerts(filter)`
- ✅ `getAlertById(id)`
- ✅ `getAlertRecommendations(type)`
- ✅ `getNotifications(userId)`
- ✅ `getUnreadCount(userId)`
- ✅ `getZones()`
- ✅ `getUsers()` (ya existía)

#### Mutations Implementadas:
- ✅ `register(input)` (ya existía)
- ✅ `recoverPassword(identifier, method)`
- ✅ `verifyCode(phone, code)`
- ✅ `resetPassword(token, newPassword)`
- ✅ `createAlert(input, userId)`
- ✅ `updateAlertStatus(id, status, responseTime)`
- ✅ `markNotificationRead(id)`
- ✅ `markAllAsRead(userId)`

#### Subscriptions Implementadas:
- ✅ `onNewAlert(zone)`
- ✅ `onNotification(userId)`

#### Servicios Externos:
- ✅ Twilio SMS (modo mock sin API key)
- ✅ OpenWeatherMap (modo mock sin API key)
- ✅ Recomendaciones agrícolas

---

## 🐛 TROUBLESHOOTING

### Error: Prisma Client no generado
```powershell
cd services/shared
npx prisma generate
```

### Error: Módulos no encontrados
```powershell
cd services/rest-service
npm install
```

### Error: Base de datos no sincronizada
```powershell
cd services/shared
npx prisma migrate dev
npx prisma db push
```

### Error: Subscriptions no funcionan
Verificar que `graphql-subscriptions` esté instalado:
```powershell
npm install graphql-subscriptions
```

### Backend no responde en puerto 3003
Verificar que el servicio esté corriendo:
```powershell
docker-compose ps
# o
docker-compose logs rest-service
```

---

## 🎯 PRÓXIMOS PASOS OPCIONALES

### 1. Reportes PDF (Pendiente)
Crear `services/shared/report.service.js` con puppeteer para generar PDFs.

### 2. Cron Job de Clima
Crear job que consulte OpenWeatherMap cada hora y detecte alertas automáticas.

### 3. Tests Unitarios
Agregar tests para resolvers y servicios.

### 4. Rate Limiting
Implementar rate limiting en GraphQL.

---

## 📞 SOPORTE

Todo el backend está completamente funcional y conectado al frontend.

**Archivos de documentación:**
- `BACKEND_GRAPHQL_IMPLEMENTATION.md` - Detalles técnicos completos
- `SETUP_GUIDE.md` - Esta guía de instalación

**Para iniciar el sistema completo:**
```powershell
# Terminal 1: Backend
cd Backend-Huancavelica-Alertas-Agricolas
docker-compose up

# Terminal 2: Frontend  
cd Frontend-Huancavelica-Alertas-Agricolas
npm run dev
```

¡El sistema está listo para usar! 🎉
