FROM node:20 AS builder
# Use service folder as build context; copy package files first
WORKDIR /usr/src/app
# Copy only package files first to take advantage of layer caching
COPY package*.json ./
RUN apt-get update -y && apt-get install -y ca-certificates --no-install-recommends && rm -rf /var/lib/apt/lists/* \
 && npm ci --legacy-peer-deps --no-audit --no-fund

# Copy service sources into the builder (context is the service folder)
COPY . ./

# Copy shared prisma schema if present so prisma generate can run (sibling ../shared)
RUN mkdir -p prisma && cp ../shared/prisma/schema.prisma prisma/schema.prisma || true

# Prisma client generation (if schema present)

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
RUN apt-get update -y && apt-get install -y ca-certificates curl --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Copy built app and production deps from builder
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
# If the source files aren't present in the builder stage (monorepo builds may omit them),
# prefer running the compiled output from `dist`. Avoid copying `src` to prevent COPY errors.

EXPOSE 3004
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s CMD curl -f http://localhost:3004/healthz || exit 1
CMD ["sh","-c","if [ -f dist/main.js ]; then node dist/main.js; else node src/main.js; fi"]