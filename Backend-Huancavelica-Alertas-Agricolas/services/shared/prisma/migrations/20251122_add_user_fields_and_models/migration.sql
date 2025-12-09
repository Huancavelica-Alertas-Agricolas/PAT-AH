-- Migration: add user fields and new models
-- Created: 2025-11-22

-- Add new columns to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "preferredChannel" TEXT DEFAULT 'email';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "alertasReportadas" INTEGER DEFAULT 0;

-- Create Notification table
CREATE TABLE IF NOT EXISTS "Notification" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tipo" TEXT NOT NULL,
  "titulo" TEXT NOT NULL,
  "mensaje" TEXT NOT NULL,
  "leido" BOOLEAN NOT NULL DEFAULT false,
  "prioridad" TEXT NOT NULL DEFAULT 'media',
  "userId" UUID NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create VerificationCode table
CREATE TABLE IF NOT EXISTS "VerificationCode" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "codigo" TEXT NOT NULL,
  "tipo" TEXT NOT NULL,
  "usado" BOOLEAN NOT NULL DEFAULT false,
  "expiraEn" TIMESTAMP WITH TIME ZONE NOT NULL,
  "userId" UUID NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "VerificationCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "Notification_userId_leido_idx" ON "Notification"("userId", "leido");
CREATE INDEX IF NOT EXISTS "VerificationCode_codigo_usado_expiraEn_idx" ON "VerificationCode"("codigo", "usado", "expiraEn");