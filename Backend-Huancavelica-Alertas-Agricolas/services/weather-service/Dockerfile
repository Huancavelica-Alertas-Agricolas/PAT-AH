FROM node:20 AS builder
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps --no-audit --no-fund

# Copy source and prepare reports dir (context is repo root)
COPY . ./
RUN mkdir -p reports
RUN mkdir -p prisma && cp services/shared/prisma/schema.prisma prisma/schema.prisma || true
RUN npm run build && npm prune --production || true

# Prisma client generation (added by patch)
RUN if [ -f ./prisma/schema.prisma ]; then \
			npx prisma@5.22.0 generate --schema=./prisma/schema.prisma || true; \
		elif [ -f /tmp/schema.prisma ]; then \
			npx prisma@5.22.0 generate --schema=/tmp/schema.prisma || true; \
		else \
			echo "[prisma] no schema found, skipping generate"; \
		fi

FROM node:20-slim
WORKDIR /usr/src/app
ENV NODE_ENV=production
# Ensure certificates and diagnostic tools available at runtime
RUN apt-get update -y && apt-get install -y ca-certificates curl iproute2 procps --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Copy built app and production deps from builder
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/reports ./reports
COPY --from=builder /usr/src/app/src ./src

EXPOSE 3002
CMD ["sh","-c","if [ -f dist/main.js ]; then node dist/main.js; else node src/main.js; fi"]