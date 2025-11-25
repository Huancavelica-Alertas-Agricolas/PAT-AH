# Builder stage uses repo root as context; copy only service files
FROM node:20 AS builder
WORKDIR /usr/src/app
COPY services/ingest-service/package*.json ./
RUN npm ci --legacy-peer-deps --no-audit --no-fund || true
# Copy only the ingest-service sources into the image
COPY services/ingest-service/. ./
# Copy shared Prisma schema into local prisma dir and generate client if present
RUN mkdir -p prisma && cp services/shared/prisma/schema.prisma prisma/schema.prisma || true
RUN if [ -f "prisma/schema.prisma" ]; then npx prisma generate --schema=prisma/schema.prisma || true; fi
# Skip build; runtime uses JS in src/
FROM node:20-slim
WORKDIR /usr/src/app
ENV NODE_ENV=production
RUN apt-get update -y && apt-get install -y openssl ca-certificates curl iproute2 procps --no-install-recommends && rm -rf /var/lib/apt/lists/*
COPY --from=builder /usr/src/app/src ./src
COPY --from=builder /usr/src/app/node_modules ./node_modules
EXPOSE 3020
CMD ["sh","-c","if [ -f dist/main.js ]; then node dist/main.js; elif [ -f src/index.js ]; then node src/index.js; else node src/main.js; fi"]
