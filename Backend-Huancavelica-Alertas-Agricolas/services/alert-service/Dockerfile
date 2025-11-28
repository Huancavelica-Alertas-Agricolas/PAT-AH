FROM node:20 AS builder
WORKDIR /usr/src/app

# Copy only the alert-service package files and source into the builder
# (the compose build context is repo root, so copy service subfolder explicitly)
COPY services/alert-service/package*.json ./
COPY services/alert-service/ ./

# Copy shared prisma schema if present so prisma generate can run
COPY services/shared/prisma/schema.prisma ./prisma/schema.prisma

# Install dependencies and build inside the service folder
RUN npm ci --legacy-peer-deps --no-audit --no-fund

# Prisma client generation (if schema present)
RUN if [ -f ./prisma/schema.prisma ]; then \
      npx prisma@5.22.0 generate --schema=./prisma/schema.prisma || true; \
    else \
      echo "[prisma] no schema found, skipping generate"; \
    fi

# Build the service
RUN npm run build && npm prune --production || true

FROM node:20-slim
WORKDIR /usr/src/app
ENV NODE_ENV=production

# Ensure certificates available (no openssl required unless Prisma used)
RUN apt-get update -y && apt-get install -y ca-certificates --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Copy built app and production deps from builder
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
# If the source files aren't present in the builder stage (monorepo builds may omit them),
# prefer running the compiled output from `dist`. Avoid copying `src` to prevent COPY errors.

EXPOSE 3004
CMD ["sh","-c","if [ -f dist/main.js ]; then node dist/main.js; else node src/main.js; fi"]