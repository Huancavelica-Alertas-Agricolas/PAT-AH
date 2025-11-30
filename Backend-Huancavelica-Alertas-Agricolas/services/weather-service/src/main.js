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
      port: parseInt(process.env.PORT) || 3002,
    },
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.useGlobalFilters(new AllExceptionsFilter(logger));
  await app.listen();
  logger.info('🌤️ Weather Service is listening on port 3002');
  // Start a small HTTP health endpoint (separate port) — prefer Prisma ping when available
  try {
    const http = require('http');
    const net = require('net');
    const healthPort = parseInt(process.env.HEALTH_PORT) || 3005;
    const parseUrlHostPort = (url) => {
      try {
        const m = url.match(/@([^:/]+)(?::(\d+))?/);
        if (m)
          return { host: m[1], port: parseInt(m[2] || '5432') };
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
        const components = { service: 'weather-service' };
        let ok = true;
        try {
          if (process.env.DATABASE_URL) {
            try {
              const { PrismaClient } = require('@prisma/client');
              const prisma = new PrismaClient();
              try {
                await prisma.$queryRaw`SELECT 1`;
                components.db = 'ok';
              }
              catch (e) {
                components.db = 'error';
                ok = false;
              }
              try { await prisma.$disconnect(); } catch (_) { }
            }
            catch (e) {
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
        res.writeHead(ok ? 200 : 503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: ok ? 'ok' : 'error', components }));
        return;
      }
      res.writeHead(404);
      res.end();
    });
    server.listen(healthPort, () => logger.info(`🩺 Weather health endpoint listening on ${healthPort}`));
  }
  catch (e) {
    logger.warn('Weather health endpoint not started:', e?.message || e);
  }
}

bootstrap();