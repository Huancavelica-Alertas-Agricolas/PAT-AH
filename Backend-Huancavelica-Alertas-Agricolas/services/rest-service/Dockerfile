# Builder stage uses repo root as context; copy only service files
FROM node:20-bookworm AS builder
WORKDIR /usr/src/app
# Install build-time deps and certs, then install node deps
COPY package*.json ./
RUN apt-get update -y \
 && apt-get install -y openssl ca-certificates --no-install-recommends \
 && rm -rf /var/lib/apt/lists/* \
 && npm install --legacy-peer-deps --no-audit --no-fund

# Copy sources and generate Prisma client if present
COPY . ./
RUN mkdir -p prisma && cp ../shared/prisma/schema.prisma prisma/schema.prisma || true
RUN if [ -f "prisma/schema.prisma" ]; then npx prisma generate --schema=prisma/schema.prisma; fi

# Final runtime: use a minimal image that does not include npm or extra OS packages
FROM node:20-slim
WORKDIR /usr/src/app
ENV NODE_ENV=production

# Copy CA certificates from builder (if any) to ensure TLS works
COPY --from=builder /etc/ssl/certs /etc/ssl/certs

# Copy the app from the builder stage
COPY --from=builder /usr/src/app /usr/src/app

# Remove dev dependencies to keep runtime slim (if present)
RUN if [ -f package.json ]; then cd /usr/src/app && npm prune --production || true; fi

# Use non-root user for security
USER 1000

# Expose application port and run wait-for-db helper before starting the app
EXPOSE 3003
CMD ["node","scripts/wait-for-db.js","db","5432","--","node","src/main.js"]
