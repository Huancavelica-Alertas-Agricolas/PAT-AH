FROM node:20 AS builder
WORKDIR /usr/src/app

# Install dependencies (prefer lockfile when present)
COPY package*.json ./
RUN npm ci --legacy-peer-deps --no-audit --no-fund

# Copy source and build
COPY . .
RUN npm run build && npm prune --production || true

FROM node:20-slim
WORKDIR /usr/src/app
ENV NODE_ENV=production

# Ensure certificates available (no openssl required unless Prisma used)
RUN apt-get update -y && apt-get install -y ca-certificates --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Copy built app and production deps from builder
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/src ./src

EXPOSE 3004
CMD ["sh","-c","if [ -f dist/main.js ]; then node dist/main.js; else node src/main.js; fi"]