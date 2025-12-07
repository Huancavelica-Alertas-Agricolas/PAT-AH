# Flujo N8N - Alertas Multicanal

## Estado: ✅ FUNCIONAL

### Descripción
Flujo de trabajo n8n completamente operativo para envío de alertas agrícolas a través de múltiples canales: SMS, Email y Telegram.

### Webhook
```
URL: https://climatrack0.app.n8n.cloud/webhook/webhook/clima-alerta
Método: POST
Content-Type: application/json
```

### Estructura del Flujo (Paralelo)

```
Webhook
  ↓
SetPayload (normalizar datos)
  ↓
SplitInBatches (batch_size=1)
  ├─ Twilio (SMS) ────┐
  ├─ SMTP (Email) ────┼→ Postgres → Success
  └─ Telegram ────────┘
```

### Payload de Entrada
```json
{
  "recipients": ["+51987654321", "+51912345678"],
  "email": "usuario@example.com",
  "telegram_chat_id": "123456789",
  "descripcion": "Alerta de temperatura extrema detectada",
  "tipo": "temperatura"
}
```

### Integraciones Configuradas

| Canal | Servicio | Estado |
|-------|----------|--------|
| SMS | Twilio | ✅ Activo |
| Email | SMTP | ✅ Activo |
| Mensajes | Telegram | ✅ Activo |
| BD | PostgreSQL Render | ✅ Activo |

### Base de Datos
- **Servidor**: Render PostgreSQL
- **Base de datos**: bd_pat_ah
- **Tabla**: n8n_alert_logs
- **Estructura**:
  - id (SERIAL PRIMARY KEY)
  - tipo (VARCHAR 50)
  - descripcion (TEXT)
  - recipients (TEXT - JSON)
  - created_at (TIMESTAMP)

### Pruebas Realizadas
- ✅ Webhook responde 200 OK
- ✅ Flujo completo ejecuta sin errores
- ✅ Ejecución en paralelo verificada
- ✅ Registro en BD confirmado
- ✅ Integraciones externas validadas

### Próximos Pasos
1. Integrar con backend para envío automático de alertas
2. Crear tabla User en BD para preferencias de usuarios
3. Mejorar mapeo de datos para evaluación correcta de expresiones
4. Implementar manejo de errores y reintentos

### Contacto
Webhook URL disponible para integración inmediata.
