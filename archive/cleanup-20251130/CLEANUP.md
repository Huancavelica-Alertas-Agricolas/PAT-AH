# Archive: cleanup-20251130

Fecha: 2025-11-30

Motivo: mover archivos generados, logs y backups innecesarios fuera de la rama principal para reducir ruido, peso del repo y riesgos de incluir artefactos locales.

Contenido movido:

- Frontend backups (moved from `Frontend-Huancavelica-Alertas-Agricolas/src/backup`):
  - `ui-20251107/` (17 archivos: `all-ui.tsx`, `button.tsx`, `command.tsx`, `context-menu.tsx`, `data-display.tsx`, `dropdown-menu.tsx`, `forms.tsx`, `input.tsx`, `label.tsx`, `navbar.tsx`, `navigation-menu.tsx`, `overlay.tsx`, `pagination.tsx`, `popover.tsx`, `table.tsx`, `tabs.tsx`, `tooltip.tsx`)

- Backend outputs and logs (moved from `Backend-Huancavelica-Alertas-Agricolas`):
  - `render_deploy_info.txt`
  - `services/dev/list_minio_artifacts_output.txt`
  - `services/weather-service/build-output.txt`
  - `services/weather-service/npm-install-output.txt` (renamed to `npm-install-output-weather.txt`)
  - `services/alert-service/npm-install-output.txt` (renamed to `npm-install-output-alert-service.txt`)
  - `services/notification-service/npm-install-output.txt` (renamed to `npm-install-output-notification_service.txt`)

Acciones realizadas:

- Se creó la rama `chore/cleanup` y se commitearon los movimientos en ella.
- Se actualizó `.gitignore` para evitar reincidencia: se añadieron patrones para `**/*_output.txt`, `**/npm-install-output.txt`, `**/build-output.txt`, `render_deploy_info.txt` y `Frontend-Huancavelica-Alertas-Agricolas/src/backup/`.

Siguiente pasos recomendados:

1. Revisión en PR: crea un PR desde `chore/cleanup` a `dev` y revisa los archivos movidos. Si todo está OK, mergear.
2. Después del merge, eliminar definitivamente los archivos que no se necesiten, o conservar en un bucket/artefact storage si requieren historial.
3. Configurar CI para prevenir commits de archivos generados, y añadir un pre-commit hook (husky) que bloquee archivos coincidentes con estas reglas.

Si quieres, puedo crear automáticamente el PR y añadir una descripción con este `CLEANUP.md`.
