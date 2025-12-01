# Imagen base de Node.js (usando debian en lugar de alpine para evitar problemas con OpenSSL)
FROM node:20-slim

# Instalar OpenSSL y otras dependencias
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Directorio de trabajo
WORKDIR /app

# Copiar package.json de la raíz
COPY package*.json ./

# Instalar dependencias de la raíz (para twilio, node-fetch)
RUN npm install --legacy-peer-deps || true

# Copiar todo el código
COPY . .

# Instalar dependencias del servicio REST
WORKDIR /app/services/rest-service
RUN npm install --legacy-peer-deps

# Instalar Prisma CLI globalmente
RUN npm install -g prisma

# Instalar dependencias nativas de PostgreSQL
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Exponer puerto
EXPOSE 3003

# El comando se ejecutará desde docker-compose
