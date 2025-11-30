const { ValidationPipe } = require('@nestjs/common');
const { AllExceptionsFilter } = require('./all-exceptions.filter');
const { NestFactory } = require('@nestjs/core');
const { Transport } = require('@nestjs/microservices');
const { AppModule } = require('./app.module');
const logger = require('./logger');

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: parseInt(process.env.PORT) || 3003,
    },
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.useGlobalFilters(new AllExceptionsFilter(logger));
  await app.listen();
  logger.info('📧 Notification Service is listening on port 3003');

  // Start a small HTTP health endpoint (separate port) using Node's http module
  try {
    const http = require('http');
    const net = require('net');
    const healthPort = parseInt(process.env.HEALTH_PORT) || 3004;
    const parseUrlHostPort = (url) => {
      try {
        const m = url.match(/@([^:/]+)(?::(\d+))?/);
        if (m) return { host: m[1], port: parseInt(m[2] || '6379') };
      }
      catch (e) { }
      return null;
    };
    const tryConnect = (host, port, timeout = 1000) => new Promise((resolve) => {
      if (!host || !port) return resolve(false);
      const s = new net.Socket();
      let done = false;
      s.setTimeout(timeout);
      s.once('error', () => { if (!done) { done = true; s.destroy(); resolve(false); } });
      s.once('timeout', () => { if (!done) { done = true; s.destroy(); resolve(false); } });
      s.connect(port, host, () => { if (!done) { done = true; s.end(); resolve(true); } });
    });

    const server = http.createServer(async (req, res) => {
      if (req.url === '/healthz') {
        const components = { service: 'notification-service' };
        let ok = true;
        // DB check if configured — prefer Prisma ping when available
        try {
          if (process.env.DATABASE_URL) {
            let usedPrisma = false;
            try {
              const { PrismaClient } = require('@prisma/client');
              const prisma = new PrismaClient();
              try {
                await prisma.$queryRaw`SELECT 1`;
                components.db = 'ok';
                usedPrisma = true;
              }
              catch (e) {
                components.db = 'error';
                ok = false;
              }
              try { await prisma.$disconnect(); } catch (_) { }
            }
            catch (e) {
              // Prisma not available — fallback to TCP check
            }

            if (!components.db) {
              const db = parseUrlHostPort(process.env.DATABASE_URL);
              const up = await tryConnect(db?.host, db?.port);
              components.db = up ? 'ok' : 'error';
              if (!up) ok = false;
            }
          }
          else {
            components.db = 'not-configured';
          }
        }
        catch (e) {
          components.db = 'error';
          ok = false;
        }

        // Queue check (Redis or RabbitMQ)
        try {
          if (process.env.REDIS_URL) {
            const r = parseUrlHostPort(process.env.REDIS_URL);
            const up = await tryConnect(r?.host, r?.port || 6379);
            components.queue = up ? 'ok' : 'error';
            if (!up) ok = false;
          }
          else if (process.env.RABBITMQ_URL) {
            const r = parseUrlHostPort(process.env.RABBITMQ_URL);
            const up = await tryConnect(r?.host, r?.port || 5672);
            components.queue = up ? 'ok' : 'error';
            if (!up) ok = false;
          }
          else {
            components.queue = 'not-configured';
          }
        }
        catch (e) {
          components.queue = 'error';
          ok = false;
        }

        res.writeHead(ok ? 200 : 503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: ok ? 'ok' : 'error', components }));
        return;
      }
      res.writeHead(404);
      res.end();
    });
    server.listen(healthPort, () => logger.info(`🩺 Notification health endpoint listening on ${healthPort}`));
  }
  catch (e) {
    logger.warn('Notification health endpoint not started:', e?.message || e);
  }
}

bootstrap();