
-- Migration: add TrainingDataset table
-- Created: 2025-11-22

-- Use uuid-ossp extension and uuid_generate_v4() for UUID defaults
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Note: this SQL creates a table to store metadata for uploaded training datasets (Excel/CSV).
CREATE TABLE IF NOT EXISTS "TrainingDataset" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "fileName" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "columns" JSONB NOT NULL,
  "rowCount" INTEGER NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trainingdataset_createdat ON "TrainingDataset" ("createdAt");
