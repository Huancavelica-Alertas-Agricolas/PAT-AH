-- SQL para crear las tablas basadas en el esquema de Prisma
-- Ejecuta esto en tu base de datos PostgreSQL (ej. en Render via DBeaver)

-- Nota: Render PostgreSQL usa gen_random_uuid() built-in, no necesita extensión uuid-ossp

-- Tabla User
CREATE TABLE "User" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "nombre" TEXT,
  "email" TEXT UNIQUE,
  "telefono" TEXT UNIQUE NOT NULL,
  "password" TEXT NOT NULL,
  "ciudad" TEXT,
  "zona" TEXT,
  "activo" BOOLEAN DEFAULT TRUE,
  "prefs" TEXT,
  "roles" TEXT DEFAULT '["usuario"]',
  "alertasReportadas" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla Alert
CREATE TABLE "Alert" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "titulo" TEXT NOT NULL,
  "descripcion" TEXT,
  "tipo" TEXT,
  "severidad" TEXT,
  "prioridad" TEXT DEFAULT 'media',
  "estado" TEXT DEFAULT 'activa',
  "ubicacion" TEXT,
  "zona" TEXT,
  "reportadoPor" TEXT,
  "tiempoRespuesta" INTEGER,
  "activa" BOOLEAN DEFAULT TRUE,
  "fecha" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "metadata" TEXT,
  "userId" UUID,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL
);

-- Tabla Log
CREATE TABLE "Log" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "nivel" TEXT NOT NULL,
  "mensaje" TEXT NOT NULL,
  "contexto" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "userId" UUID,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL
);

-- Tabla TrainingDataset (ya en migration.sql, pero incluido para completitud)
CREATE TABLE "TrainingDataset" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "fileName" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "columns" JSONB NOT NULL,
  "rowCount" INTEGER NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla Zone
CREATE TABLE "Zone" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "nombre" TEXT UNIQUE NOT NULL,
  "region" TEXT NOT NULL,
  "alertasActivas" INTEGER DEFAULT 0,
  "poblacion" INTEGER DEFAULT 0,
  "latitud" REAL NOT NULL,
  "longitud" REAL NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla Notification
CREATE TABLE "Notification" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tipo" TEXT NOT NULL,
  "titulo" TEXT NOT NULL,
  "mensaje" TEXT NOT NULL,
  "leido" BOOLEAN DEFAULT FALSE,
  "prioridad" TEXT DEFAULT 'media',
  "userId" UUID NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Tabla WeatherData
CREATE TABLE "WeatherData" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "zona" TEXT NOT NULL,
  "temperatura" REAL NOT NULL,
  "humedad" REAL NOT NULL,
  "precipitacion" REAL NOT NULL,
  "velocidadViento" REAL NOT NULL,
  "descripcion" TEXT,
  "fecha" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla VerificationCode
CREATE TABLE "VerificationCode" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "codigo" TEXT NOT NULL,
  "tipo" TEXT NOT NULL,
  "usado" BOOLEAN DEFAULT FALSE,
  "expiraEn" TIMESTAMP WITH TIME ZONE NOT NULL,
  "userId" UUID NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Tabla Recommendation
CREATE TABLE "Recommendation" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tipoAlerta" TEXT NOT NULL,
  "titulo" TEXT NOT NULL,
  "descripcion" TEXT NOT NULL,
  "prioridad" TEXT NOT NULL,
  "orden" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla Report
CREATE TABLE "Report" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "cultivo" TEXT NOT NULL,
  "fechaInicio" TIMESTAMP WITH TIME ZONE NOT NULL,
  "fechaFin" TIMESTAMP WITH TIME ZONE NOT NULL,
  "temperaturaPromedio" REAL,
  "precipitacionTotal" REAL,
  "humedadPromedio" REAL,
  "totalAlertas" INTEGER DEFAULT 0,
  "archivoUrl" TEXT,
  "generadoPor" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices adicionales (basados en @@index en Prisma)
CREATE INDEX idx_alert_userid ON "Alert" ("userId");
CREATE INDEX idx_log_userid ON "Log" ("userId");
CREATE INDEX idx_trainingdataset_createdat ON "TrainingDataset" ("createdAt");
CREATE INDEX idx_notification_userid_leido ON "Notification" ("userId", "leido");
CREATE INDEX idx_weatherdata_zona_fecha ON "WeatherData" ("zona", "fecha");
CREATE INDEX idx_verificationcode_codigo_usado_expiraen ON "VerificationCode" ("codigo", "usado", "expiraEn");
CREATE INDEX idx_recommendation_tipoalerta ON "Recommendation" ("tipoAlerta");
CREATE INDEX idx_report_cultivo_fechainicio_fechafin ON "Report" ("cultivo", "fechaInicio", "fechaFin");