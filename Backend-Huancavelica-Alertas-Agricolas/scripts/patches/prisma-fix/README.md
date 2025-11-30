Parche sugerido: Alinear Prisma (sin commits)

Objetivo:
- Asegurar que cada servicio que usa Prisma incluya `@prisma/client@5.22.0` en `dependencies`.
- Ejecutar `npx prisma generate` durante la etapa de build si el schema está disponible en la carpeta del servicio o en `/tmp/schema.prisma`.

Nota importante:
- NO hago commits ni sobrescribo archivos del repositorio. Aquí tienes los snippets y un script opcional que puedes ejecutar/manualizar cuando quieras.

Servicios objetivo:
- notification-service
- alert-service
- weather-service

Qué contiene este directorio:
- `notification.package.json.add` : JSON snippet para añadir a `dependencies`.
- `alert.package.json.add` : JSON snippet para añadir a `dependencies`.
- `weather.package.json.add` : JSON snippet para añadir a `dependencies`.
- `dockerfile.generate.snippet` : bloque a insertar en la sección `builder` de los `Dockerfile` de los servicios.
- `apply_snippets.ps1` : script PowerShell opcional que aplica los cambios en archivos `package.json` y `Dockerfile` (modifica archivos, no hace commits). Úsalo sólo si quieres aplicar los cambios ahora.

Instrucciones manuales (recomendado):
1. Revisar los snippets en este directorio.
2. Para cada `services/<svc>/package.json` añadir la línea en `dependencies`:
   "@prisma/client": "5.22.0"
3. En el `Dockerfile` del servicio (dentro de la etapa `builder`, tras `RUN npm ci ...`) añadir el bloque contenido en `dockerfile.generate.snippet`.
4. Reconstruir las imágenes:
   docker compose build --no-cache
   docker compose up -d

Si prefieres que aplique los cambios localmente (sin commitear), ejecuta `apply_snippets.ps1` desde la carpeta `Backend-Huancavelica-Alertas-Agricolas`.

---

Hecho por el asistente — no se han realizado commits ni cambios automáticos sobre el repositorio por defecto.
