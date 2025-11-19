# Builder stage uses repo root as context; copy only service files
FROM node:18 AS builder
WORKDIR /usr/src/app
COPY services/ingest-service/package*.json ./
RUN npm ci --legacy-peer-deps --no-audit --no-fund || true
# Copy only the ingest-service sources into the image
COPY services/ingest-service/. ./
# Copy shared Prisma schema into local prisma dir and generate client if present
RUN mkdir -p prisma && cp services/shared/prisma/schema.prisma prisma/schema.prisma || true
RUN if [ -f "prisma/schema.prisma" ]; then npx prisma generate --schema=prisma/schema.prisma || true; fi
# Skip build; runtime uses JS in src/

FROM node:18-slim
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY --from=builder /usr/src/app/src ./src
COPY --from=builder /usr/src/app/node_modules ./node_modules
EXPOSE 3020
CMD ["node","src/main.js"]
