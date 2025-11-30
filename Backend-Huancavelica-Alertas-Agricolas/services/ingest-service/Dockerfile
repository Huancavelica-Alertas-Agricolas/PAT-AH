# Builder stage uses repo root as context; copy only service files
FROM node:20 AS builder
# Builder stage expects service folder context
WORKDIR /usr/src/app
# Copy package files from service context
COPY package*.json ./
RUN npm ci --legacy-peer-deps --no-audit --no-fund || true
# Copy service sources into image (context = service folder)
COPY . ./
# Copy shared Prisma schema from sibling ../shared if present
RUN mkdir -p prisma && cp ../shared/prisma/schema.prisma prisma/schema.prisma || true
RUN if [ -f "prisma/schema.prisma" ]; then npx prisma generate --schema=prisma/schema.prisma || true; fi
# Skip build; runtime uses JS in src/
FROM node:20-slim
WORKDIR /usr/src/app
ENV NODE_ENV=production
RUN apt-get update -y && apt-get install -y openssl ca-certificates curl iproute2 procps --no-install-recommends && rm -rf /var/lib/apt/lists/*
COPY --from=builder /usr/src/app/src ./src
COPY --from=builder /usr/src/app/node_modules ./node_modules
EXPOSE 3020
CMD ["sh","-c","if [ -f dist/main.js ]; then node dist/main.js; elif [ -f src/index.js ]; then node src/index.js; else node src/main.js; fi"]
