# 🧪 SCRIPT DE PRUEBAS - Backend GraphQL con JWT y WebSockets

## ⚠️ PREREQUISITOS

Antes de ejecutar las pruebas, asegúrate de tener:

1. **PostgreSQL corriendo** en `localhost:5433` (o ajusta DATABASE_URL en `.env`)
2. **Node.js 18+** instalado
3. **Dependencias instaladas**: `npm install` en `services/rest-service`

---

## 📝 PASO 1: Iniciar PostgreSQL

### Opción A: Con Docker (Recomendado)
```powershell
# Iniciar solo PostgreSQL
cd C:\Users\DARIO\Backend-Huancavelica-Alertas-Agricolas\Backend-Huancavelica-Alertas-Agricolas
docker-compose up -d db

# Verificar que esté corriendo
docker-compose ps db
```

### Opción B: PostgreSQL Local
Si tienes PostgreSQL instalado localmente, crear base de datos:
```sql
CREATE DATABASE pat_ah;
CREATE USER pat WITH PASSWORD 'pat';
GRANT ALL PRIVILEGES ON DATABASE pat_ah TO pat;
```

---

## 📝 PASO 2: Ejecutar Migración

```powershell
cd C:\Users\DARIO\Backend-Huancavelica-Alertas-Agricolas\Backend-Huancavelica-Alertas-Agricolas\services\shared

# Generar cliente Prisma
npx prisma generate

# Crear migración
npx prisma migrate dev --name add_graphql_features

# Ejecutar seeds (datos de prueba)
node prisma/seed.js
```

**✅ Resultado esperado:**
```
✔ Generated Prisma Client
✔ The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20251201_add_graphql_features/
      └─ migration.sql

✔ Seeded database with:
  - 5 users
  - 5 zones
  - 5 alerts
  - 20 notifications
  - 35 weather records
  - 11 recommendations
```

---

## 📝 PASO 3: Instalar Dependencias

```powershell
cd C:\Users\DARIO\Backend-Huancavelica-Alertas-Agricolas\Backend-Huancavelica-Alertas-Agricolas\services\rest-service

npm install
```

**✅ Resultado esperado:**
```
added 3 packages
  - graphql-subscriptions@2.0.0
  - twilio@5.0.0
  - node-fetch@2.7.0
```

---

## 📝 PASO 4: Iniciar Servidor Backend

```powershell
cd C:\Users\DARIO\Backend-Huancavelica-Alertas-Agricolas\Backend-Huancavelica-Alertas-Agricolas\services\rest-service

npm run start
```

**✅ Resultado esperado:**
```
[Nest] 12345  - 12/01/2025, 2:30:45 AM     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 12/01/2025, 2:30:46 AM     LOG [GraphQLModule] Mapped {/api/graphql, POST} route
[Nest] 12345  - 12/01/2025, 2:30:46 AM     LOG [NestApplication] Nest application successfully started
```

**🌐 GraphQL Playground:** http://localhost:3003/api/graphql

---

## 🧪 PASO 5: PRUEBAS CON JWT

### **Test 1: Login y Obtener Token JWT**

Abrir http://localhost:3003/api/graphql y ejecutar:

```graphql
mutation Login {
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

**✅ Respuesta esperada:**
```json
{
  "data": {
    "login": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbTQ3cTBuN2EwMDAwMTNtdW1udWF6eWFhIiwicGhvbmUiOiIrNTE5OTkwMDAwMDEiLCJlbWFpbCI6ImFkbWluQGFsZXJ0YXNlZ3VyYS5wZSIsInJvbGVzIjpbImFkbWluaXN0cmFkb3IiXSwiaWF0IjoxNzMzMDMyOTQ1LCJleHAiOjE3MzMxMTkzNDV9.Xy1Z2A3B4C5D6E7F8G9H0I1J2K3L4M5N6O7P8Q9R0S1",
      "user": {
        "id": "cm47q0n7a000013mumnu azyaa",
        "nombre": "Admin Sistema",
        "email": "admin@alertasegura.pe",
        "telefono": "+51999000001",
        "roles": ["administrador"]
      }
    }
  }
}
```

**🔑 COPIAR EL TOKEN** - Lo usaremos en las siguientes pruebas.

---

### **Test 2: Query con Autenticación JWT**

En la pestaña **HTTP HEADERS** del Playground (abajo), agregar:

```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbTQ3cTBuN2EwMDAwMTNtdW1udWF6eWFhIiwicGhvbmUiOiIrNTE5OTkwMDAwMDEiLCJlbWFpbCI6ImFkbWluQGFsZXJ0YXNlZ3VyYS5wZSIsInJvbGVzIjpbImFkbWluaXN0cmFkb3IiXSwiaWF0IjoxNzMzMDMyOTQ1LCJleHAiOjE3MzMxMTkzNDV9.Xy1Z2A3B4C5D6E7F8G9H0I1J2K3L4M5N6O7P8Q9R0S1"
}
```

Luego ejecutar:

```graphql
query GetAlerts {
  getAlerts(filter: { zone: ["Huancavelica Centro"] }) {
    id
    title
    description
    type
    severity
    priority
    status
    zone
    location
    time
  }
}
```

**✅ Respuesta esperada:**
```json
{
  "data": {
    "getAlerts": [
      {
        "id": "alert1",
        "title": "Helada Nocturna Severa",
        "description": "Se esperan temperaturas bajo cero",
        "type": "helada",
        "severity": "alta",
        "priority": "alta",
        "status": "activa",
        "zone": "Huancavelica Centro",
        "location": "Plaza de Armas",
        "time": "2025-12-01T03:00:00.000Z"
      }
    ]
  }
}
```

**❌ Si no incluyes el token:**
```json
{
  "errors": [
    {
      "message": "Unauthorized",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

---

### **Test 3: Verificar Contenido del Token (Decodificar JWT)**

Ir a https://jwt.io y pegar tu token para ver el payload:

**Ejemplo de payload decodificado:**
```json
{
  "userId": "cm47q0n7a000013mumnu azyaa",
  "phone": "+51999000001",
  "email": "admin@alertasegura.pe",
  "roles": ["administrador"],
  "iat": 1733032945,
  "exp": 1733119345
}
```

**🔍 Explicación:**
- `userId`: ID único del usuario en la base de datos
- `phone`: Teléfono del usuario
- `email`: Email del usuario
- `roles`: Array de roles (administrador, autoridad, usuario)
- `iat`: Issued At (cuándo se creó el token) - Unix timestamp
- `exp`: Expiration (cuándo expira) - Unix timestamp (24h después de iat)

---

## 🔌 PASO 6: PRUEBAS DE WEBSOCKETS

### **Test 4: Subscription de Alertas en Tiempo Real**

**Abrir 2 pestañas del GraphQL Playground:**

#### **PESTAÑA 1: Suscribirse a Alertas**

```graphql
subscription ListenAlerts {
  onNewAlert(zone: "Huancavelica Centro") {
    id
    title
    description
    type
    severity
    priority
    zone
    location
    time
  }
}
```

**✅ Resultado:** La pestaña se queda "escuchando" (muestra "Listening...")

---

#### **PESTAÑA 2: Crear Nueva Alerta**

Primero, agregar el token JWT en HTTP HEADERS (igual que Test 2).

Luego ejecutar:

```graphql
mutation CreateAlert {
  createAlert(
    input: {
      title: "🔥 PRUEBA WEBSOCKET - Alerta de Incendio"
      description: "Esta es una prueba de WebSocket en tiempo real"
      type: "helada"
      severity: "alta"
      priority: "alta"
      zone: "Huancavelica Centro"
      location: "Sector Norte"
      reportedBy: "Admin Sistema"
    },
    userId: "cm47q0n7a000013mumnu azyaa"  # Usar el userId real de tu login
  ) {
    id
    title
    status
    reportedAt
  }
}
```

**✅ Resultado en PESTAÑA 1 (INSTANTÁNEO):**
```json
{
  "data": {
    "onNewAlert": {
      "id": "alert999",
      "title": "🔥 PRUEBA WEBSOCKET - Alerta de Incendio",
      "description": "Esta es una prueba de WebSocket en tiempo real",
      "type": "helada",
      "severity": "alta",
      "priority": "alta",
      "zone": "Huancavelica Centro",
      "location": "Sector Norte",
      "time": "2025-12-01T07:45:23.000Z"
    }
  }
}
```

**🎉 ¡FUNCIONA! La alerta llegó EN TIEMPO REAL sin hacer polling.**

---

### **Test 5: Subscription de Notificaciones**

#### **PESTAÑA 1: Suscribirse a Notificaciones**

```graphql
subscription ListenNotifications {
  onNotification(userId: "cm47q0n7a000013mumnu azyaa") {  # Tu userId
    id
    type
    title
    message
    timestamp
    priority
    read
  }
}
```

#### **PESTAÑA 2: Crear Notificación**

```graphql
mutation CreateNotification {
  createNotification(input: {
    userId: "cm47q0n7a000013mumnu azyaa"
    type: "alert"
    title: "🔔 Nueva Alerta en tu Zona"
    message: "Se detectó helada severa en Huancavelica Centro"
    priority: "alta"
  })
}
```

**✅ Resultado en PESTAÑA 1 (INSTANTÁNEO):**
```json
{
  "data": {
    "onNotification": {
      "id": "notif123",
      "type": "alert",
      "title": "🔔 Nueva Alerta en tu Zona",
      "message": "Se detectó helada severa en Huancavelica Centro",
      "timestamp": "2025-12-01T07:50:00.000Z",
      "priority": "alta",
      "read": false
    }
  }
}
```

---

## 🔐 PASO 7: PRUEBAS DE RECUPERACIÓN DE CONTRASEÑA

### **Test 6: Flujo Completo de Recuperación**

#### **Paso 6.1: Solicitar Código de Verificación**

```graphql
mutation RecoverPassword {
  recoverPassword(
    identifier: "+51999000001",
    method: "sms"
  )
}
```

**✅ Resultado:**
```json
{
  "data": {
    "recoverPassword": true
  }
}
```

**📱 En modo MOCK (sin Twilio configurado):**
El código se imprime en la consola del servidor:
```
[SMS Mock] Código de verificación para +51999000001: 847362
```

---

#### **Paso 6.2: Verificar Código**

```graphql
mutation VerifyCode {
  verifyCode(
    phone: "+51999000001",
    code: "847362"  # El código que viste en la consola
  )
}
```

**✅ Resultado (si el código es correcto y no expiró):**
```json
{
  "data": {
    "verifyCode": true
  }
}
```

**❌ Si el código es incorrecto:**
```json
{
  "data": {
    "verifyCode": false
  }
}
```

---

#### **Paso 6.3: Resetear Contraseña**

```graphql
mutation ResetPassword {
  resetPassword(
    token: "+51999000001",
    newPassword: "nuevaPassword456"
  )
}
```

**✅ Resultado:**
```json
{
  "data": {
    "resetPassword": true
  }
}
```

---

#### **Paso 6.4: Login con Nueva Contraseña**

```graphql
mutation LoginNewPassword {
  login(phone: "+51999000001", password: "nuevaPassword456") {
    token
    user {
      nombre
    }
  }
}
```

**✅ Resultado:**
```json
{
  "data": {
    "login": {
      "token": "eyJhbGci...",
      "user": {
        "nombre": "Admin Sistema"
      }
    }
  }
}
```

**🎉 ¡Recuperación de contraseña funcionando!**

---

## 📊 PASO 8: PRUEBAS ADICIONALES

### **Test 7: Obtener Recomendaciones Agrícolas**

```graphql
query GetRecommendations {
  getAlertRecommendations(type: "helada") {
    id
    title
    description
    priority
  }
}
```

**✅ Resultado:**
```json
{
  "data": {
    "getAlertRecommendations": [
      {
        "id": "rec1",
        "title": "Protección de Cultivos",
        "description": "Cubrir plantas con plástico o paja antes de las 6 PM",
        "priority": "alta"
      },
      {
        "id": "rec2",
        "title": "Riego Pre-Helada",
        "description": "Regar cultivos 2-3 horas antes del anochecer",
        "priority": "alta"
      }
    ]
  }
}
```

---

### **Test 8: Obtener Zonas con Coordenadas**

```graphql
query GetZones {
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

**✅ Resultado:**
```json
{
  "data": {
    "getZones": [
      {
        "id": "zone1",
        "name": "Huancavelica Centro",
        "region": "Huancavelica",
        "activeAlerts": 2,
        "population": 50000,
        "coordinates": {
          "lat": -12.7867,
          "lng": -74.9758
        }
      }
    ]
  }
}
```

---

### **Test 9: Actualizar Estado de Alerta**

```graphql
mutation UpdateAlert {
  updateAlertStatus(
    id: "alert1",  # ID de una alerta existente
    status: "resuelta",
    responseTime: 45  # 45 minutos
  ) {
    id
    status
    responseTime
  }
}
```

**✅ Resultado:**
```json
{
  "data": {
    "updateAlertStatus": {
      "id": "alert1",
      "status": "resuelta",
      "responseTime": 45
    }
  }
}
```

---

### **Test 10: Marcar Notificaciones como Leídas**

```graphql
mutation MarkAsRead {
  markAllAsRead(userId: "cm47q0n7a000013mumnu azyaa")
}
```

**✅ Resultado:**
```json
{
  "data": {
    "markAllAsRead": 5  # Número de notificaciones marcadas
  }
}
```

---

## ✅ CHECKLIST DE FUNCIONALIDAD

Después de ejecutar todas las pruebas:

- ✅ **JWT funcionando**: Token generado en login
- ✅ **Autenticación**: Queries requieren token válido
- ✅ **WebSocket conectado**: Subscriptions funcionan en tiempo real
- ✅ **Alertas en tiempo real**: onNewAlert recibe eventos instantáneos
- ✅ **Notificaciones push**: onNotification funciona
- ✅ **Recuperación de contraseña**: Flujo completo con SMS (mock)
- ✅ **Recomendaciones**: getAlertRecommendations retorna datos
- ✅ **Zonas con coordenadas**: getZones retorna lat/lng
- ✅ **CRUD de alertas**: Crear, leer, actualizar estado
- ✅ **Notificaciones**: Marcar como leídas

---

## 🎯 RESULTADO FINAL

```
Sistema AlertaSegura Huancavelica:
✅ Backend GraphQL completamente funcional
✅ Autenticación JWT con expiración 24h
✅ WebSockets para comunicación en tiempo real
✅ Subscriptions de alertas y notificaciones
✅ Recuperación de contraseña con SMS
✅ Recomendaciones agrícolas por tipo de alerta
✅ 5 usuarios de prueba
✅ 5 zonas de Huancavelica
✅ Datos meteorológicos
✅ Listo para conectar con React Frontend
```

---

## 🚀 PRÓXIMOS PASOS

1. **Configurar Twilio real** (opcional):
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxx...
   TWILIO_AUTH_TOKEN=xxxxxx...
   TWILIO_PHONE_NUMBER=+51999999999
   ```

2. **Configurar OpenWeatherMap** (opcional):
   ```env
   OPENWEATHER_API_KEY=xxxxxxxx...
   ```

3. **Conectar Frontend**:
   - Apollo Client configurado con JWT en headers
   - WebSocket Link para subscriptions
   - Hooks para useAlertSubscription

4. **Deploy a Producción**:
   - Configurar HTTPS para WebSocket Secure (WSS)
   - JWT_SECRET fuerte en variables de entorno
   - Rate limiting en GraphQL

---

## 📞 SOPORTE

**Archivos de referencia:**
- `AUTHENTICATION_WEBSOCKETS_GUIDE.md` - Guía detallada de JWT y WebSockets
- `BACKEND_GRAPHQL_IMPLEMENTATION.md` - Documentación técnica completa
- `SETUP_GUIDE.md` - Guía de instalación paso a paso

**¡Todo funcionando! 🎉**
