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
FROM gcr.io/distroless/nodejs:20
WORKDIR /usr/src/app
ENV NODE_ENV=production

# Copy CA certificates from builder (distroless images don't contain apt)
COPY --from=builder /etc/ssl/certs /etc/ssl/certs

# Copy the app from the builder stage
COPY --from=builder /usr/src/app /usr/src/app

# Use a non-root user if the builder created one (optional)
USER 1000

# Expose port (informational) and run the app
EXPOSE 3003
CMD ["node","src/main.js"]
