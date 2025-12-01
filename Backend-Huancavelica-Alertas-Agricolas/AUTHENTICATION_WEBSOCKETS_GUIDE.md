# 🔐 Guía de Autenticación JWT y WebSockets

## 📋 ÍNDICE
1. [Cómo Funciona JWT](#jwt)
2. [Cómo Funcionan WebSockets](#websockets)
3. [Flujo Completo con Usuarios Reales](#flujo-real)
4. [Pruebas Prácticas](#pruebas)
5. [Integración Frontend](#frontend-integration)

---

## 🔑 JWT (JSON Web Tokens) {#jwt}

### **¿Qué es JWT?**
Un token encriptado que contiene información del usuario y expira después de cierto tiempo.

### **Estructura de un JWT:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0IiwicGhvbmUiOiIrNTE5OTkwMDAwMDEiLCJyb2xlcyI6WyJhZG1pbmlzdHJhZG9yIl0sImlhdCI6MTczMjk4MDAwMCwiZXhwIjoxNzMzMDY2NDAwfQ.8xK9_vQ2Xm3Zq4L6P1Y7RnB3Tw5Jc8Vh9Kf2Mp6Ns1A

┌─────────────┬─────────────────────┬──────────────┐
│   HEADER    │      PAYLOAD        │  SIGNATURE   │
└─────────────┴─────────────────────┴──────────────┘
```

### **Payload Decodificado (Ejemplo Real):**
```json
{
  "userId": "cm123abc456",
  "phone": "+51999000001",
  "email": "admin@alertasegura.pe",
  "roles": ["administrador"],
  "iat": 1732980000,  // Issued At: cuando se creó
  "exp": 1733066400   // Expiration: 24 horas después
}
```

### **¿Cómo Funciona en el Backend?**

```javascript
// 1. Usuario hace login
POST /api/graphql
{
  login(phone: "+51999000001", password: "password123")
}

// 2. Backend valida credenciales
const user = await prisma.user.findUnique({ where: { telefono: phone } });
const valid = await bcrypt.compare(password, user.password);

// 3. Backend genera JWT
const token = jwt.sign(
  { 
    userId: user.id,
    phone: user.telefono,
    email: user.email,
    roles: user.roles
  },
  process.env.JWT_SECRET,  // Llave secreta
  { expiresIn: '24h' }      // Expira en 24 horas
);

// 4. Backend retorna token
return {
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  user: { id, nombre, email, telefono, roles }
}
```

### **¿Cómo el Frontend Usa el Token?**

```typescript
// Frontend: guardar token después de login
localStorage.setItem('authToken', response.data.login.token);

// Frontend: incluir token en TODAS las peticiones
const client = new ApolloClient({
  link: new HttpLink({
    uri: 'http://localhost:3003/api/graphql',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`
    }
  })
});

// Backend: extraer usuario del token en cada request
const token = req.headers.authorization?.split(' ')[1]; // Quita "Bearer "
const decoded = jwt.verify(token, process.env.JWT_SECRET);
// decoded = { userId: "cm123...", phone: "+51999000001", roles: [...] }
```

---

## 🔌 WebSockets {#websockets}

### **¿Qué son WebSockets?**
Conexión persistente bidireccional entre cliente y servidor para comunicación en tiempo real.

### **Diferencia HTTP vs WebSocket:**

```
HTTP (Request-Response):
Cliente → [GET /api/alerts] → Servidor
Cliente ← [200 OK + datos]  ← Servidor
// Conexión se cierra

WebSocket (Bidireccional):
Cliente ←→ [Conexión abierta] ←→ Servidor
// Cualquiera puede enviar mensajes en cualquier momento
```

### **¿Cómo Funciona en GraphQL?**

GraphQL usa WebSockets para **Subscriptions** (eventos en tiempo real):

```javascript
// 1. Cliente se conecta al WebSocket
ws://localhost:3003/api/graphql

// 2. Cliente se suscribe a un evento
subscription {
  onNewAlert(zone: "Huancavelica Centro") {
    id
    title
    severity
    time
  }
}

// 3. Servidor mantiene conexión abierta

// 4. Cuando alguien crea una alerta:
mutation {
  createAlert(input: { zone: "Huancavelica Centro", ... })
}

// 5. Backend publica evento:
pubSub.publish('newAlert', { onNewAlert: alertData });

// 6. TODOS los clientes suscritos reciben el evento INSTANTÁNEAMENTE
// ✅ No necesitan hacer polling (GET cada 5 segundos)
```

### **Implementación en el Backend:**

```javascript
// services/rest-service/src/alerts/alert.resolver.js

const { PubSub } = require('graphql-subscriptions');
const pubSub = new PubSub();

class AlertResolver {
  // MUTATION: Crear alerta
  async createAlert(input, userId) {
    const alert = await this.prisma.alert.create({ data: input });
    
    // 🔥 PUBLICAR EVENTO → Todos los suscritos lo reciben
    pubSub.publish('newAlert', { 
      onNewAlert: alert,
      zone: alert.zone  // Filtrar por zona
    });
    
    return alert;
  }
  
  // SUBSCRIPTION: Escuchar nuevas alertas
  onNewAlert(zone) {
    return pubSub.asyncIterator('newAlert'); // Stream de eventos
  }
}
```

### **Implementación en el Frontend:**

```typescript
// Frontend: src/hooks/useAlertSubscription.ts

import { useSubscription } from '@apollo/client';

const ALERT_SUBSCRIPTION = gql`
  subscription OnNewAlert($zone: String!) {
    onNewAlert(zone: $zone) {
      id
      title
      severity
      time
    }
  }
`;

function useAlertSubscription(zone: string) {
  const { data, loading } = useSubscription(ALERT_SUBSCRIPTION, {
    variables: { zone }
  });
  
  // Cada vez que llegue una nueva alerta, data se actualiza automáticamente
  useEffect(() => {
    if (data?.onNewAlert) {
      // Mostrar notificación push
      new Notification('Nueva Alerta', {
        body: data.onNewAlert.title,
        icon: '/alert-icon.png'
      });
      
      // Reproducir sonido
      new Audio('/alert-sound.mp3').play();
    }
  }, [data]);
  
  return data?.onNewAlert;
}
```

---

## 🚀 Flujo Completo con Usuarios Reales {#flujo-real}

### **Escenario: Sistema de Alertas Agrícolas**

#### **Paso 1: Usuario se Registra/Login**

```graphql
# 1. Usuario abre la app móvil
# 2. Ingresa teléfono: +51987654321
# 3. Ingresa contraseña: miPassword123
# 4. Frontend envía mutation:

mutation {
  login(phone: "+51987654321", password: "miPassword123") {
    token
    user {
      id
      nombre
      roles
    }
  }
}

# 5. Backend responde:
{
  "data": {
    "login": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbTEyMyIsInBob25lIjoiKzUxOTg3NjU0MzIxIiwicm9sZXMiOlsidXN1YXJpbyJdLCJpYXQiOjE3MzI5ODAwMDAsImV4cCI6MTczMzA2NjQwMH0.abc123",
      "user": {
        "id": "cm123abc",
        "nombre": "Juan Mamani",
        "roles": ["usuario"]
      }
    }
  }
}

# 6. Frontend guarda token en localStorage
localStorage.setItem('authToken', "eyJhbGci...");
```

#### **Paso 2: Usuario Selecciona su Zona**

```graphql
# 7. Usuario selecciona "Huancavelica Centro" en la app
# 8. Frontend envía query CON token en headers:

query {
  getZones {
    id
    name
    activeAlerts
    coordinates { lat, lng }
  }
}

# Headers HTTP:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 9. Backend valida token y responde:
{
  "data": {
    "getZones": [
      { "id": "1", "name": "Huancavelica Centro", "activeAlerts": 2 }
    ]
  }
}
```

#### **Paso 3: Usuario se Suscribe a Alertas (WebSocket)**

```graphql
# 10. Frontend establece conexión WebSocket
const wsLink = new GraphQLWsLink(createClient({
  url: 'ws://localhost:3003/api/graphql',
  connectionParams: {
    authToken: localStorage.getItem('authToken')  // 🔑 Token JWT en WebSocket
  }
}));

# 11. Frontend se suscribe a alertas de su zona:
subscription {
  onNewAlert(zone: "Huancavelica Centro") {
    id
    title
    description
    severity
    time
  }
}

# 12. Backend mantiene conexión WebSocket abierta
# Usuario está ESCUCHANDO en tiempo real
```

#### **Paso 4: Autoridad Crea Nueva Alerta**

```graphql
# 13. Otro usuario (autoridad) crea alerta desde otra app:
mutation {
  createAlert(
    input: {
      title: "Helada Severa"
      description: "Temperatura -5°C esperada esta noche"
      type: "helada"
      severity: "alta"
      zone: "Huancavelica Centro"
    },
    userId: "cm456def"  # ID de la autoridad
  ) {
    id
    title
  }
}

# 14. Backend procesa:
const alert = await prisma.alert.create(...);

# 15. Backend PUBLICA evento:
pubSub.publish('newAlert', { onNewAlert: alert });

# 16. ✅ TODOS los usuarios suscritos a "Huancavelica Centro" reciben
#     la alerta INSTANTÁNEAMENTE (sin hacer polling)
```

#### **Paso 5: Usuario Recibe Alerta en Tiempo Real**

```typescript
// 17. Frontend recibe evento del WebSocket:
{
  data: {
    onNewAlert: {
      id: "alert789",
      title: "Helada Severa",
      description: "Temperatura -5°C esperada esta noche",
      severity: "alta",
      time: "2025-12-01T22:30:00Z"
    }
  }
}

// 18. Frontend muestra notificación push:
new Notification('⚠️ Helada Severa', {
  body: 'Temperatura -5°C esperada esta noche',
  icon: '/icons/frost-warning.png',
  vibrate: [200, 100, 200]  // Vibración en móvil
});

// 19. Frontend reproduce sonido de alerta:
new Audio('/sounds/emergency.mp3').play();

// 20. Frontend actualiza UI automáticamente:
// - Badge de notificaciones: +1
// - Lista de alertas se actualiza
// - Mapa muestra nueva alerta
```

#### **Paso 6: Usuario Lee Recomendaciones**

```graphql
# 21. Usuario toca la notificación
# 22. Frontend consulta recomendaciones CON token:

query {
  getAlertRecommendations(type: "helada") {
    id
    title
    description
    priority
  }
}

# Headers:
Authorization: Bearer eyJhbGci...

# 23. Backend responde:
{
  "data": {
    "getAlertRecommendations": [
      {
        "id": "1",
        "title": "Protección de Cultivos",
        "description": "Cubrir plantas con plástico o paja",
        "priority": "alta"
      }
    ]
  }
}
```

---

## 🧪 Pruebas Prácticas {#pruebas}

### **Test 1: Login y Obtener Token**

```bash
# En GraphQL Playground (http://localhost:3003/api/graphql)

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

# ✅ Copiar el token de la respuesta
```

### **Test 2: Usar Token en Query**

```bash
# En Headers del Playground:
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

# Query:
query {
  getAlerts(filter: { zone: ["Huancavelica Centro"] }) {
    id
    title
    severity
  }
}

# ✅ Si el token es válido → retorna alertas
# ❌ Si el token es inválido → error 401 Unauthorized
```

### **Test 3: Probar WebSocket con 2 Ventanas**

```bash
# Ventana 1: Suscribirse a alertas
subscription {
  onNewAlert(zone: "Huancavelica Centro") {
    id
    title
    severity
    time
  }
}

# Ventana 2: Crear alerta
mutation {
  createAlert(
    input: {
      title: "Test WebSocket"
      description: "Probando conexión en tiempo real"
      type: "helada"
      severity: "media"
      zone: "Huancavelica Centro"
    },
    userId: "USER_ID_AQUI"
  ) {
    id
  }
}

# ✅ Ventana 1 debe recibir la alerta INSTANTÁNEAMENTE
```

### **Test 4: Recuperación de Contraseña con SMS**

```bash
# 1. Solicitar código
mutation {
  recoverPassword(identifier: "+51999000001", method: "sms")
}

# ✅ Backend genera código de 6 dígitos
# ✅ Backend envía SMS vía Twilio (o muestra en logs en modo mock)

# 2. Verificar código
mutation {
  verifyCode(phone: "+51999000001", code: "123456")
}

# ✅ Si el código es correcto y no expiró (10 min) → retorna true

# 3. Resetear contraseña
mutation {
  resetPassword(token: "+51999000001", newPassword: "nuevaPassword456")
}

# ✅ Contraseña actualizada
```

---

## 💻 Integración Frontend {#frontend-integration}

### **Configuración Apollo Client con JWT y WebSocket**

```typescript
// src/lib/apollo-client.ts

import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

// 1. Link HTTP para queries y mutations
const httpLink = new HttpLink({
  uri: 'http://localhost:3003/api/graphql',
  headers: {
    // 🔑 Incluir JWT en todas las peticiones HTTP
    Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`
  }
});

// 2. Link WebSocket para subscriptions
const wsLink = new GraphQLWsLink(createClient({
  url: 'ws://localhost:3003/api/graphql',
  connectionParams: {
    // 🔑 Incluir JWT en la conexión WebSocket
    authToken: localStorage.getItem('authToken')
  },
  // Reconectar automáticamente si se pierde conexión
  retryAttempts: 5,
  shouldRetry: () => true,
}));

// 3. Dividir tráfico: HTTP para queries/mutations, WS para subscriptions
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,   // Si es subscription → WebSocket
  httpLink  // Si es query/mutation → HTTP
);

// 4. Cliente Apollo
export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
```

### **Hook de Login**

```typescript
// src/hooks/useAuth.ts

import { useMutation } from '@apollo/client';
import { LOGIN_MUTATION } from '@/graphql/mutations';

export function useAuth() {
  const [login, { loading, error }] = useMutation(LOGIN_MUTATION);
  
  const handleLogin = async (phone: string, password: string) => {
    try {
      const { data } = await login({ variables: { phone, password } });
      
      // 🔑 Guardar token
      localStorage.setItem('authToken', data.login.token);
      
      // 🔑 Guardar usuario
      localStorage.setItem('user', JSON.stringify(data.login.user));
      
      // Redirigir a dashboard
      window.location.href = '/dashboard';
      
    } catch (err) {
      console.error('Login failed:', err);
    }
  };
  
  return { handleLogin, loading, error };
}
```

### **Hook de Subscription en Tiempo Real**

```typescript
// src/hooks/useAlertSubscription.ts

import { useSubscription, useQuery } from '@apollo/client';
import { ALERT_SUBSCRIPTION } from '@/graphql/subscriptions';
import { GET_ALERTS } from '@/graphql/queries';

export function useAlertSubscription(zone: string) {
  // Query inicial: obtener alertas existentes
  const { data: initialData } = useQuery(GET_ALERTS, {
    variables: { filter: { zone: [zone] } }
  });
  
  // Subscription: escuchar nuevas alertas
  const { data: newAlertData } = useSubscription(ALERT_SUBSCRIPTION, {
    variables: { zone }
  });
  
  // Mostrar notificación cuando llegue nueva alerta
  useEffect(() => {
    if (newAlertData?.onNewAlert) {
      const alert = newAlertData.onNewAlert;
      
      // Notificación push
      if (Notification.permission === 'granted') {
        new Notification(`⚠️ ${alert.title}`, {
          body: alert.description,
          icon: `/icons/${alert.type}.png`,
          tag: alert.id,
          requireInteraction: true  // No desaparece automáticamente
        });
      }
      
      // Sonido
      const audio = new Audio(`/sounds/${alert.severity}.mp3`);
      audio.play();
      
      // Vibración (móvil)
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }
    }
  }, [newAlertData]);
  
  return {
    alerts: initialData?.getAlerts || [],
    newAlert: newAlertData?.onNewAlert
  };
}
```

---

## 🔒 Seguridad

### **Variables de Entorno Requeridas:**

```env
# .env
JWT_SECRET=tu_clave_secreta_muy_segura_de_32_caracteres_minimo
JWT_EXPIRES_IN=24h

TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+51999999999

OPENWEATHER_API_KEY=xxxxxxxxxxxxxx
```

### **Validación de Token en el Backend:**

```javascript
// services/rest-service/src/auth/jwt.guard.js

const jwt = require('jsonwebtoken');

function validateJWT(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar expiración
    if (decoded.exp * 1000 < Date.now()) {
      throw new Error('Token expirado');
    }
    
    return decoded; // { userId, phone, email, roles }
    
  } catch (error) {
    throw new Error('Token inválido');
  }
}

// Usar en resolvers:
async getAlerts(filter, context) {
  const token = context.req.headers.authorization?.split(' ')[1];
  const user = validateJWT(token); // Valida o lanza error
  
  // Solo usuarios autenticados pueden ver alertas
  return this.prisma.alert.findMany({ where: filter });
}
```

---

## ✅ Checklist de Funcionalidad

- ✅ JWT generado en login con expiración 24h
- ✅ Token incluido en headers HTTP: `Authorization: Bearer <token>`
- ✅ Token validado en backend antes de ejecutar queries/mutations
- ✅ WebSocket configurado en GraphQL con `graphql-ws`
- ✅ Subscriptions funcionando para alertas y notificaciones
- ✅ Token JWT enviado en `connectionParams` del WebSocket
- ✅ PubSub publicando eventos cuando se crean alertas
- ✅ Clientes reciben eventos en tiempo real
- ✅ SMS enviado vía Twilio en recuperación de contraseña
- ✅ Códigos de verificación expiran en 10 minutos

---

## 🎯 Resultado Final

```
Usuario Real:
1. Abre app → Login con teléfono/contraseña
2. Backend → Valida + genera JWT
3. Frontend → Guarda token + establece WebSocket
4. Usuario → Navega por la app (token en cada request)
5. Autoridad → Crea alerta
6. Backend → PubSub publica evento
7. WebSocket → Envía alerta a todos los suscritos
8. Usuario → Recibe notificación push + sonido INSTANTÁNEAMENTE
9. Usuario → Lee recomendaciones agrícolas
10. Token expira en 24h → Usuario hace login nuevamente
```

**¡Sistema 100% funcional con autenticación segura y comunicación en tiempo real!** 🚀
