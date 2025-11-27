# Builder stage uses repo root as context; copy only service files
FROM node:20 AS builder
WORKDIR /usr/src/app
# Copy package files from service context
COPY package*.json ./
RUN apt-get update -y && apt-get install -y openssl ca-certificates --no-install-recommends && rm -rf /var/lib/apt/lists/* \
 && npm install --legacy-peer-deps --no-audit --no-fund
# Copy service sources (expecting build context to be the service folder)
COPY . ./
# Copy shared Prisma schema from sibling `../shared` when present
RUN mkdir -p prisma && cp ../shared/prisma/schema.prisma prisma/schema.prisma || true
RUN if [ -f "prisma/schema.prisma" ]; then npx prisma generate --schema=prisma/schema.prisma; fi
# No build step required; runtime uses JS in src/

FROM node:20-slim
WORKDIR /usr/src/app
ENV NODE_ENV=production
# Ensure OpenSSL and diagnostic tools are available in runtime for Prisma query engine compatibility and debugging
RUN apt-get update -y && apt-get install -y openssl ca-certificates curl iproute2 procps --no-install-recommends && rm -rf /var/lib/apt/lists/*
COPY --from=builder /usr/src/app/src ./src
COPY --from=builder /usr/src/app/node_modules ./node_modules
EXPOSE 3003
CMD ["node","src/main.js"]
