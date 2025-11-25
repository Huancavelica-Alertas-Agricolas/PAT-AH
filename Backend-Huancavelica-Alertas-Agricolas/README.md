 **Resumen**
 Este repositorio contiene el backend del proyecto de Alertas Agrícolas para Huancavelica. La carpeta `services/` agrupa microservicios y existen artefactos relacionados con un monolito (`Dockerfile.monolith`, `README_MONOLITH.md`).

 **Estructura principal**
 - `docker-compose.yml`: composición principal para desarrollo/despliegue (verificar diferencias con `docker-compose.all.yml`).
 - `Dockerfile.monolith`: Dockerfile para versión monolítica (documentar su uso si se mantiene).
 - `services/`: cada subcarpeta es un microservicio (ej.: `ai-service`, `weather-service`, `auth-service`).
 - `scripts/`: utilidades y scripts de soporte.
 - `backups/`: (recomendado) ubicación para copias y archivos grandes (no versionar en ramas activas).

 **Recomendaciones rápidas**
 - No versionar `node_modules/`: ya se añadió `.gitignore` con `node_modules/` y archivos comunes.
 - Mover respaldos y archivos ZIP a `backups/` o almacenamiento externo fuera del repositorio activo.
 - Documentar si se trabaja con el monolito o con microservicios y cuándo usar `docker-compose.all.yml`.

 **Estructura recomendada por servicio**
 Cada carpeta `services/<service>/` debería incluir al menos:
 - `README.md` (uso y endpoints principales)
 - `package.json` o equivalente (dependencias)
 - `Dockerfile` si se containeriza
 - `src/` o `app/` con código fuente
 - `tests/` con pruebas unitarias / integradas
 - `env.example` o `config/` para configuración

 **Cómo ejecutar localmente (sugerencia)**
 1. Instalar dependencias en cada servicio (si aplica): `npm install` dentro de `services/<service>`.
 2. Levantar los servicios en modo desarrollo con `docker-compose up --build` desde la raíz del backend.

 **Buenas prácticas**
 - Mantener `backups/` fuera de la rama principal o como artefacto en un storage externo.
 - Añadir `CONTRIBUTING.md` para flujos de trabajo y estándares de commits.
 - Revisar `.github/workflows/` para CI por servicio y probar pipelines separados por microservicio cuando sea posible.

 **Contacto**
 Para cambios estructurales importantes (mover carpetas, eliminar backups), coordinar con el equipo antes de commitear.
