# Builder stage uses repo root as context; copy only service files
FROM node:20-bookworm AS builder
WORKDIR /usr/src/app
# Install build-time deps and certs, then install node deps
COPY Backend-Huancavelica-Alertas-Agricolas/services/rest-service/package*.json ./
RUN apt-get update -y \
 && apt-get install -y openssl ca-certificates --no-install-recommends \
 && rm -rf /var/lib/apt/lists/* \
 && npm install --legacy-peer-deps --no-audit --no-fund

# Copy sources and generate Prisma client if present
COPY . ./
RUN mkdir -p prisma && cp Backend-Huancavelica-Alertas-Agricolas/services/shared/prisma/schema.prisma prisma/schema.prisma || true
RUN if [ -f "prisma/schema.prisma" ]; then npx prisma generate --schema=prisma/schema.prisma; fi

# Final runtime: use a minimal image that does not include npm or extra OS packages
FROM node:20-bookworm
WORKDIR /usr/src/app
ENV NODE_ENV=production

# Copy CA certificates from builder (if any) to ensure TLS works
COPY --from=builder /etc/ssl/certs /etc/ssl/certs

# Copy the app from the builder stage
COPY --from=builder /usr/src/app/Backend-Huancavelica-Alertas-Agricolas/services/rest-service /usr/src/app

# Use non-root user for security
USER 1000

# Expose application port
EXPOSE 3003
CMD ["node","src/main.js"]
