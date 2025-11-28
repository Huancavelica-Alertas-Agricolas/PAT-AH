# Frontend — Huancavelica Alertas Agrícolas

Breve guía de buenas prácticas, configuración y comandos comunes para el frontend (React + Vite + TypeScript).

## Resumen
- Stack: `React`, `Vite`, `TypeScript`, `axios`.
- Objetivo: aplicación SPA que consume la API REST gateway (`rest-service`) y muestra el dashboard.

## Requisitos locales
- Node.js LTS (ej. 18/20), npm o yarn
- Git
- Acceso al backend (local via Docker Compose o URL remota)

## Variables de entorno
- `VITE_API_URL` — URL base del gateway REST (p. ej. `http://localhost:3003/api`).
- `VITE_OFFLINE_DEMO` — (boolean) fuerza datos demo cuando el backend no esté disponible.

Guarda variables en `.env` (no comitear `.env` en git).

## Comandos comunes
- Instalar dependencias:
  - `npm install`
- Ejecutar en modo desarrollo:
  - `npm run dev`
- Construir para producción:
  - `npm run build`
- Servir build localmente (ver scripts o usar `serve`):
  - `npx serve dist`
- Tests (si existen):
  - `npm test`

## Buenas prácticas de desarrollo
- Mantener tipos estrictos en TypeScript y evitar `any` salvo casos controlados.
- Separar lógica de hooks (p. ej. `useAuth`, `useWeather`) y componentes UI.
- Manejar errores de red con reintentos limitados y mostrar mensajes útiles al usuario.
- Centralizar la configuración de axios (instancia con interceptores para `Authorization` y 401).
- Evitar side-effects en componentes; preferir hooks `useEffect` con dependencias estables y `useCallback`/`useMemo` para memorizar.
- Evitar polución del global scope (no instalar scripts externos no confiables). Si hay scripts de terceros, aislar y envolver llamadas en try/catch.

## Seguridad
- Nunca almacenar tokens sensibles en localStorage si puedes usar cookies `HttpOnly`.
- Escapar y sanitizar cualquier contenido dinámico mostrado.
- Revisar CORS y políticas de Content-Security-Policy en producción.

## Test y CI
- Agregar pruebas unitarias y e2e (Playwright o Cypress) para las rutas críticas: registro/login y flujo dashboard.
- Incluir linters y formatter (ESLint + Prettier) en CI.

## Observabilidad y debugging
- Añadir logging de cliente para errores importantes (ej. Sentry) con sampling apropiado.
- Herramientas devtools: Network tab para chequear llamadas a `VITE_API_URL` y auth headers.

## Docker / Docker Compose (dev)
- En local suele usarse `docker compose` desde el repo raíz para levantar backend y DB.
- Asegurar que `VITE_API_URL` apunte al gateway cuando se pruebe con contenedores.

## Checklist antes de PR
- Ejecutar linter y tests localmente.
- Comprobar que no se comitean secretos.
- Añadir changelog / descripción clara del cambio.

## Contribuir
- Abrir un issue para discutir características grandes.
- Crear un branch con prefijo `feat/`, `fix/`, `chore/` y enviar PR con descripción y pasos para probar.

---
Archivo generado automáticamente con prácticas recomendadas. Adáptalo a convenciones del equipo.
# Plataforma de Alertas Tempranas para Agricultores de Huancavelica

## Descripción

Aplicación Web Progresiva (PWA) diseñada para entregar alertas climáticas agrícolas a los agricultores de la región de Huancavelica, Perú. El sistema aborda desafíos como conectividad intermitente, accesibilidad lingüística (español, quechua e inglés) y uso prioritario de dispositivos móviles mediante una arquitectura offline-first.

## Estado del Proyecto

- **Frontend**: En desarrollo (Avanzado). Arquitectura, code splitting y características PWA definidas
- **Backend**: En desarrollo con arquitectura de microservicios
- **Base de datos**: Esquema implementado en PostgreSQL

## Características

- Arquitectura Offline-First con persistencia en localStorage/IndexedDB
- Soporte trilingüe (Español, Quechua, English) mediante React Context
- Sistema de alertas climáticas con clasificación de severidad
- Gestión de datos agrícolas con Custom Hooks
- Notificaciones multicanal
- Optimización de build con Manual Code Splitting
- Dashboard funcional con componentes clave

## Tecnologías Utilizadas

| Capa | Tecnología | Propósito |
|------|------------|-----------|
| Frontend Framework | React | Renderizado de UI basado en componentes |
| Build System | Vite | Bundling de módulos ES y HMR |
| Estilos | Tailwind CSS | Framework CSS utility-first |
| Componentes UI | Radix UI | Primitivas de componentes accesibles |
| Routing | React Router DOM | Enrutamiento del lado del cliente |
| Backend | NestJS | Framework para arquitectura de microservicios |
| Base de Datos | PostgreSQL | Persistencia relacional de datos |
| Mensajería | Redis Queue | Comunicación asíncrona entre microservicios |

## Instalación y Uso
```bash
# Clonar repositorio
git clone [repository-url]
cd [project-directory]

# Ejecutar sistema completo con Docker Compose
docker-compose up -d

# Desarrollo solo del frontend
npm install
npm run dev
```

## Estructura del Proyecto

El proyecto utiliza un sistema de build (Vite) y se organiza alrededor de un conjunto de archivos principales para el bootstrapping de la aplicación y la configuración de la PWA.

| Archivo / Directorio | Descripción |
|----------------------|-------------|
| `src/main.tsx` | Punto de montaje principal de React |
| `src/App.tsx` | Orquestador principal de rutas y lógica de aplicación |
| `vite.config.ts` | Configuración del sistema de build Vite |
| `manifest.json` | Configuración PWA |
| `package.json` | Dependencias del proyecto |

### Decisiones de Diseño Relacionadas con la Estructura:

- **Organización de Características (Rutas)**: Cada característica principal tiene una ruta dedicada
- **Gestión de Datos**: Operaciones abstraídas mediante Custom Hooks
- **Arquitectura Componentes**: Enfoque modular y reutilizable

## Arquitectura de Microservicios

La arquitectura del proyecto está diseñada como un sistema distribuido basado en microservicios para garantizar escalabilidad, mantenibilidad y resiliencia.

### Microservicios Principales

| Microservicio | Responsabilidad Principal |
|---------------|---------------------------|
| Gateway | Punto de entrada de peticiones externas |
| User | Gestión de usuarios y autenticación |
| Weather | Integración con APIs de datos climáticos |
| Alert | Motor de reglas para generación de alertas |
| Notification | Servicio de notificaciones multicanal |
| Log | Registro de eventos del sistema |

### Arquitectura y Comunicación

- **Persistencia Desacoplada**: Cada microservicio con base de datos independiente
- **Comunicación Síncrona**: APIs RESTful con JSON
- **Comunicación Asíncrona**: Message Broker para tareas críticas
- **Seguridad**: JWT para autenticación y autorización

## Metodología de Desarrollo

- **Control de Versiones**: Git con flujo de ramas estructurado
- **Testing**: Estrategia de pirámide de pruebas
- **Documentación**: Formatos estandarizados para documentación técnica
- **CI/CD**: Integración y despliegue continuo

## Arquitectura de Despliegue

- **Desarrollo**: Docker Compose para entorno local
- **Producción**: Infraestructura containerizada con orquestación
- **Monitoreo**: Sistema centralizado de logs y métricas
- **Backups**: Procedimientos automatizados de respaldo

## Análisis de Limitaciones

- **Alcance Técnico**: Limitaciones deliberadas en el alcance del proyecto
- **Dependencias Externas**: Consideraciones sobre APIs de terceros
- **Recursos Hardware**: Restricciones de infraestructura física

## Plan de Evolución

- **Mejoras Funcionales**: Funcionalidades planificadas para futuras iteraciones
- **Optimizaciones Técnicas**: Mejoras de rendimiento y seguridad
- **Escalabilidad**: Estrategias para crecimiento futuro

## Equipo de Desarrollo

| Nombre | Rol | Responsabilidades |
|--------|-----|-------------------|
| Lady | Líder de Proyecto | Gestión y documentación |
| Juan | Líder Backend | Arquitectura microservicios |
| Dario | Frontend | Desarrollo de interfaz |
| Angelo | DevOps | Infraestructura y despliegue |

## Documentación Asociada

- **Documentación Técnica**: Especificaciones de arquitectura y API
- **Manual de Usuario**: Guías de uso para agricultores
- **Plan de Proyecto**: Documentación de planificación y requisitos
