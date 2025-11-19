# Builder stage uses repo root as context; copy only service files
FROM node:18 AS builder
WORKDIR /usr/src/app
COPY services/users-service/package*.json ./
RUN apt-get update -y && apt-get install -y openssl ca-certificates --no-install-recommends && rm -rf /var/lib/apt/lists/* \
 && npm ci --legacy-peer-deps --no-audit --no-fund
# Copy only the users-service sources into the build context inside the image
COPY services/users-service/. ./
# Copy shared Prisma schema into local prisma dir and generate client
RUN mkdir -p prisma && cp services/shared/prisma/schema.prisma prisma/schema.prisma || true
RUN if [ -f "prisma/schema.prisma" ]; then npx prisma generate --schema=prisma/schema.prisma; fi
# No TypeScript build step required (JS runtime in `src/`)

FROM node:18-slim
WORKDIR /usr/src/app
ENV NODE_ENV=production
# Ensure OpenSSL is available in runtime for Prisma query engine compatibility
RUN apt-get update -y && apt-get install -y openssl ca-certificates --no-install-recommends && rm -rf /var/lib/apt/lists/*
# Copy runtime JS sources and installed node_modules from builder
COPY --from=builder /usr/src/app/src ./src
COPY --from=builder /usr/src/app/node_modules ./node_modules
EXPOSE 3002
CMD ["node","src/main.js"]
