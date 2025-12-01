# Imagen base de Node.js
FROM node:20-alpine

# Directorio de trabajo
WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer puerto de Vite
EXPOSE 5173

# El comando se ejecutará desde docker-compose
