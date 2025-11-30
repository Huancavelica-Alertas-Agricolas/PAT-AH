# n8n - Workflows de ejemplo para Agro-Alertas

Este directorio contiene un workflow de ejemplo para n8n (`alert-workflow.json`) que implementa un flujo básico para las alertas climáticas:

- Trigger Webhook (`/webhook/clima-alerta`) — recibe el payload desde `alert-service`.
- `Set` — normaliza payload.
- `SplitInBatches` — itera por destinatarios.
- `Twilio` — envía SMS.
- `Send Email` (SMTP) — envía correo.
- `Telegram` — envía mensaje a chat o canal.
- `Postgres` — registra en la tabla `n8n_alert_logs`.

NOTA: El JSON es un ejemplo con placeholders para credenciales. Debes crear las credenciales dentro de n8n (Twilio, SMTP, Telegram, Postgres) y asignarlas a los nodos.

Despliegue rápido (Docker Compose)
---------------------------------

Ejemplo mínimo `docker-compose.yml` para ejecutar n8n con Postgres:

```yaml
version: '3.7'
services:
  n8n:
    image: n8nio/n8n:latest
    ports:
      - 5678:5678
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=password
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=changeme
      - GENERIC_TIMEZONE=America/Lima
    depends_on:
      - postgres
    volumes:
      - ./n8n_data:/home/node/.n8n

  postgres:
    image: postgres:14
    environment:
      - POSTGRES_DB=n8n
      - POSTGRES_USER=n8n
      - POSTGRES_PASSWORD=password
    volumes:
      - n8n_db:/var/lib/postgresql/data

volumes:
  n8n_db:

```

Variables de entorno y credenciales a configurar
------------------------------------------------

- En n8n crear credenciales para:
  - `Twilio` (Account SID, Auth Token, From Number)
  - `SMTP` (host, port, user, pass)
  - `Telegram` (Bot Token)
  - `Postgres` (host, port, database, user, password)

- En el `alert-service` del repositorio activa n8n estableciendo en el entorno (p. ej. `docker-compose` o variables del servicio):
  - `USE_N8N_FOR_EMAIL=true`
  - `N8N_WEBHOOK_URL=http://<n8n-host>:5678/webhook/clima-alerta`
  - `N8N_WEBHOOK_SECRET` (opcional) — si configuras secret en n8n, añadir cabecera `x-n8n-signature` desde `alert-service`.

Importar el workflow
--------------------

1. Levanta n8n (ver `docker-compose.yml` arriba).
2. Abre `http://localhost:5678` y crea las credenciales necesarias (Twilio, SMTP, Telegram, Postgres).
3. Desde la interfaz de n8n: `Import` -> `From File` y selecciona `alert-workflow.json` en este directorio.
4. Edita el workflow importado y asigna las credenciales creadas a cada nodo (Twilio, SMTP, Telegram, Postgres).
5. Activa el workflow.

Notas de integración con el repo
-------------------------------

- `alert-service` ya incluye lógica para enviar a n8n (método `postToN8n` en `alert-service/src/alert.service.js`). Simplemente activa `USE_N8N_FOR_EMAIL=true` y ajusta `N8N_WEBHOOK_URL`.
- La base de datos del proyecto usa Postgres (varias services usan Postgres/Prisma/TypeORM). Puedes apuntar el nodo Postgres de n8n a la misma base de datos si quieres escribir logs directamente allí; crea la tabla `n8n_alert_logs` si no existe:

```sql
CREATE TABLE IF NOT EXISTS n8n_alert_logs (
  id serial PRIMARY KEY,
  tipo text,
  descripcion text,
  recipients jsonb,
  created_at timestamptz DEFAULT now()
);
```

Siguientes pasos recomendados
-----------------------------

- Probar el webhook enviando un payload de ejemplo desde `alert-service` (o con `curl`) y verificar que Twilio/SMTP/Telegram se desencadenan.
- Ajustar el workflow: agregar manejos de errores (Retry), backoff y logs de eventos en una tabla separada.
- Si quieres que haga validaciones/transformaciones más complejas, podemos iterar nodo por nodo y generar un JSON final adaptado a tus campos reales (por ejemplo, nombres de campos `recipients`, `telegram_chat_id`, `telefono`).

Si quieres, procedo a:

- 1) Generar una versión del workflow con nombres de campo exactamente como los usa `alert-service`.
- 2) Añadir un `docker-compose` en el repo para levantar n8n integrado con Postgres del proyecto.

Di cuál de los dos prefieres y lo hago a continuación.
