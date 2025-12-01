#!/bin/sh

echo "🚀 Iniciando backend..."

# Ir al directorio de Prisma
cd /app/services/shared/prisma || exit 1

echo "📦 Generando Prisma Client..."
npx prisma generate

echo "🗄️  Sincronizando base de datos..."
npx prisma db push

echo "✅ Prisma configurado"

# Ir al directorio del servicio REST
cd /app/services/rest-service || exit 1

echo "🎯 Iniciando servidor NestJS..."
node src/main.js
