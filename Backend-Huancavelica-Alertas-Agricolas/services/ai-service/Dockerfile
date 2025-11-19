FROM node:18 AS builder
WORKDIR /usr/src/app
# Copy only ai-service package files first (optimize npm install)
COPY services/ai-service/package*.json ./
RUN apt-get update -y && apt-get install -y openssl ca-certificates --no-install-recommends && rm -rf /var/lib/apt/lists/* \
 && npm ci --legacy-peer-deps --no-audit --no-fund
# Copy only the ai-service sources into the image
COPY services/ai-service/. ./
# Copy shared Prisma schema (if present) into local prisma dir
RUN mkdir -p prisma && cp services/shared/prisma/schema.prisma prisma/schema.prisma || true
RUN if [ -f "prisma/schema.prisma" ]; then npx prisma generate --schema=prisma/schema.prisma; fi
# No TypeScript build step required (JS runtime in `src/`)

FROM node:18-slim
WORKDIR /usr/src/app
ENV NODE_ENV=production
# Copy built app from builder stage
 # Ensure OpenSSL is available in runtime for Prisma query engine compatibility
RUN apt-get update -y && apt-get install -y openssl ca-certificates --no-install-recommends && rm -rf /var/lib/apt/lists/*
COPY --from=builder /usr/src/app/src ./src
COPY --from=builder /usr/src/app/node_modules ./node_modules
EXPOSE 3003
CMD ["node","src/main.js"]
