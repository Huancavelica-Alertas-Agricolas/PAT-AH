# 🔍 ANÁLISIS: Backend vs Frontend - Diferencias GraphQL

## ❌ LO QUE FALTA EN EL FRONTEND

### **1. REGISTRO DE USUARIOS (CRÍTICO)**

#### Backend tiene:
```javascript
// auth.resolver.js
async register(input) {
  const res = await this.authService.register(input);
  return res;
}
```

#### Frontend NO tiene:
- ❌ Mutation `REGISTER` en `mutations.ts`
- ❌ Componente `RegisterPage.tsx`
- ❌ Formulario de registro
- ❌ Link "Crear cuenta" en LoginPage

---

### **2. SUBSCRIPTIONS (WebSocket en Tiempo Real)**

#### Backend tiene:
```javascript
// alert.resolver.js
@Subscription()
onNewAlert(zone) {
  return pubSub.asyncIterator('newAlert');
}

// notification.resolver.js
@Subscription()
onNotification(userId) {
  return notificationPubSub.asyncIterator('newNotification');
}
```

#### Frontend NO tiene:
- ❌ Archivo `subscriptions.ts` con las subscriptions
- ❌ Hook `useAlertSubscription` para alertas en tiempo real
- ❌ Hook `useNotificationSubscription` para notificaciones
- ❌ WebSocket Link configurado en Apollo Client
- ❌ Notificaciones push cuando llegan alertas

---

### **3. MUTATIONS FALTANTES**

#### Backend tiene pero frontend NO:

1. **updateAlertStatus** (actualizar estado de alerta)
   ```javascript
   // Backend
   async updateAlertStatus(id, status, responseTime)
   
   // Frontend: ❌ No existe
   ```

2. **createNotification** (crear notificación)
   ```javascript
   // Backend
   async createNotification(input)
   
   // Frontend: ❌ No existe
   ```

3. **markAllAsRead** (marcar todas como leídas)
   ```javascript
   // Backend
   async markAllAsRead(userId)
   
   // Frontend: SÍ existe pero con nombre diferente
   // Frontend: markAllNotificationsRead vs Backend: markAllAsRead
   ```

---

### **4. QUERIES FALTANTES**

#### Backend tiene pero frontend NO:

1. **getAlertRecommendations** por TIPO (no por ID)
   ```javascript
   // Backend
   async getAlertRecommendations(type: string)
   
   // Frontend
   query GetAlertRecommendations($alertId: ID!)  // ❌ Usa alertId en vez de type
   ```

2. **getUnreadCount** (contador de no leídas)
   ```javascript
   // Backend
   async getUnreadCount(userId)
   
   // Frontend
   query GetUnreadCount($userId: ID!) {
     unreadNotificationsCount  // ❌ Nombre diferente
   }
   ```

---

### **5. ESTRUCTURA DE DATOS DESAJUSTADA**

#### Backend retorna:
```javascript
{
  id, title, description, type, severity, priority, status,
  time, location, zone, reportedBy, reportedAt, responseTime
}
```

#### Frontend espera:
```graphql
{
  id, title, description, type, severity, status,
  createdAt, updatedAt,
  zone { id, name, coordinates },
  meteorologicalData { temperature, humidity, ... }
}
```

**Problemas:**
- ❌ `time` (backend) vs `createdAt` (frontend)
- ❌ `zone` es String (backend) vs Object (frontend espera)
- ❌ `meteorologicalData` no existe en backend
- ❌ `affectedCrops` no existe en backend
- ❌ `recommendations` como nested object no existe

---

## ✅ LO QUE SÍ ESTÁ BIEN

### **AUTENTICACIÓN:**
- ✅ LOGIN - Ambos coinciden
- ✅ RECOVER_PASSWORD - Coincide (pero frontend espera `{success, message}` y backend retorna `boolean`)
- ✅ VERIFY_CODE - Similar estructura
- ✅ RESET_PASSWORD - Similar estructura

### **ALERTAS:**
- ✅ GET_ALERTS - Query existe en ambos
- ✅ GET_ALERT_BY_ID - Query existe
- ✅ CREATE_ALERT - Mutation existe

### **NOTIFICACIONES:**
- ✅ GET_NOTIFICATIONS - Query existe
- ✅ MARK_NOTIFICATION_READ - Mutation existe

### **ZONAS:**
- ✅ GET_ZONES - Query existe
- ✅ GET_ZONE_BY_ID - Query existe

---

## 📋 PLAN DE IMPLEMENTACIÓN

### **FASE 1: REGISTRO (Alta Prioridad)**
1. ✅ Crear mutation `REGISTER` en `mutations.ts`
2. ✅ Crear componente `RegisterPage.tsx`
3. ✅ Agregar link "Crear cuenta" en LoginPage
4. ✅ Agregar validaciones de formulario

### **FASE 2: SUBSCRIPTIONS (Alta Prioridad)**
1. ✅ Crear archivo `subscriptions.ts`
2. ✅ Agregar `ALERT_SUBSCRIPTION`
3. ✅ Agregar `NOTIFICATION_SUBSCRIPTION`
4. ✅ Configurar WebSocket Link en Apollo Client
5. ✅ Crear hook `useAlertSubscription`
6. ✅ Crear hook `useNotificationSubscription`
7. ✅ Implementar notificaciones push del navegador

### **FASE 3: AJUSTES DE QUERIES/MUTATIONS (Media Prioridad)**
1. ✅ Ajustar `GET_ALERT_RECOMMENDATIONS` para usar `type` en vez de `alertId`
2. ✅ Ajustar respuesta de `RECOVER_PASSWORD` para coincidir con backend
3. ✅ Agregar mutation `UPDATE_ALERT_STATUS`
4. ✅ Agregar mutation `CREATE_NOTIFICATION`
5. ✅ Renombrar `markAllNotificationsRead` a `markAllAsRead`

### **FASE 4: AJUSTE DE TIPOS (Baja Prioridad)**
1. Crear adapter para convertir respuesta del backend al formato del frontend
2. Agregar campos faltantes en tipos TypeScript
3. Documentar diferencias que no se pueden resolver

---

## 🎯 RESUMEN EJECUTIVO

### **Crítico (Hacer YA):**
- ❌ **REGISTER**: El frontend no puede registrar usuarios nuevos
- ❌ **SUBSCRIPTIONS**: No hay tiempo real, usuarios no reciben alertas instantáneas
- ❌ **WebSocket Link**: Apollo Client no está configurado para subscriptions

### **Importante (Hacer Pronto):**
- ⚠️ **UPDATE_ALERT_STATUS**: No se puede cambiar estado de alertas
- ⚠️ **Estructura de datos**: Queries esperan nested objects que backend no retorna

### **Mejorable (Opcional):**
- 💡 Nombres inconsistentes en queries/mutations
- 💡 Campos extras que frontend espera pero backend no tiene

---

## 📊 COMPATIBILIDAD ACTUAL

```
Autenticación:     60% ✅ (Login OK, Registro falta)
Alertas:           70% ✅ (CRUD básico OK, WebSocket falta)
Notificaciones:    50% ⚠️ (Queries OK, WebSocket falta)
Zonas:             80% ✅ (Queries OK)
Usuarios:          40% ⚠️ (Backend tiene, frontend espera estructura diferente)
Reportes:          30% ⚠️ (Frontend espera, backend no implementado)
Tiempo Real:        0% ❌ (Subscriptions no conectadas)
```

**COMPATIBILIDAD GENERAL: 55% ⚠️**

---

## ⚡ ACCIÓN INMEDIATA

Implementar en este orden:

1. **REGISTRO** (15 minutos)
2. **SUBSCRIPTIONS** (20 minutos)
3. **WEBSOCKET CONFIG** (10 minutos)
4. **AJUSTES DE QUERIES** (15 minutos)

**Total: ~60 minutos para tener 90% compatibilidad** ✅
