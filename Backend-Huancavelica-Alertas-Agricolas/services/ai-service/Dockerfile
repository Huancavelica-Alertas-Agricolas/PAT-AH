FROM node:20 AS builder
# Use service folder as build context: copy package files from current context
WORKDIR /usr/src/app
# Copy only ai-service package files first (optimize npm install)
COPY package*.json ./
RUN apt-get update -y && apt-get install -y openssl ca-certificates --no-install-recommends && rm -rf /var/lib/apt/lists/* \
 && npm ci --legacy-peer-deps --no-audit --no-fund
# Copy only the ai-service sources into the image (context should be the service folder)
COPY . ./
# Copy shared Prisma schema (if present) into local prisma dir (when building from service context, shared is at ../shared)
RUN mkdir -p prisma && cp ../shared/prisma/schema.prisma prisma/schema.prisma || true
RUN if [ -f "prisma/schema.prisma" ]; then npx prisma generate --schema=prisma/schema.prisma; fi
# No TypeScript build step required (JS runtime in `src/`)

FROM node:20-slim
WORKDIR /usr/src/app
ENV NODE_ENV=production
# Copy built app from builder stage
# Ensure OpenSSL and diagnostic tools are available in runtime for Prisma query engine compatibility and debugging
RUN apt-get update -y && apt-get install -y openssl ca-certificates curl iproute2 procps --no-install-recommends && rm -rf /var/lib/apt/lists/*
COPY --from=builder /usr/src/app/src ./src
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/trained-models ./trained-models
EXPOSE 3003
CMD ["node","src/main.js"]
