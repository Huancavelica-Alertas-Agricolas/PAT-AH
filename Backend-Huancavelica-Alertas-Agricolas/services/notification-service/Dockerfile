FROM node:20 AS builder
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps --no-audit --no-fund

# Copy source, build and prepare templates
COPY . .
RUN npm run build && mkdir -p dist/templates && cp -r src/templates/* dist/templates/ || true
RUN npm prune --production || true

FROM node:20-slim
WORKDIR /usr/src/app
ENV NODE_ENV=production
RUN apt-get update -y && apt-get install -y ca-certificates --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Copy built app and production deps from builder
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/src ./src

EXPOSE 3003
CMD ["sh","-c","if [ -f dist/main.js ]; then node dist/main.js; else node src/main.js; fi"]