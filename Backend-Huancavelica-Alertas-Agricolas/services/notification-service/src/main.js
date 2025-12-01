// Comentarios añadidos en español: arranque del notification-service, métricas y health endpoints.
// Inicia microservicio Nest (TCP), expone `/healthz` y `/metrics` según configuración.
const { ValidationPipe } = require('@nestjs/common');
const { AllExceptionsFilter } = require('./all-exceptions.filter');
const { NestFactory } = require('@nestjs/core');
const { Transport } = require('@nestjs/microservices');
const { AppModule } = require('./app.module');
const logger = require('./logger');

function safeRequire(name) {
  try { return require(name); } catch (e) { return null; }
}

function parseUrlHostPort(url) {
  try {
    const u = new URL(url);
    const defaultPort = u.protocol === 'redis:' ? 6379 : (u.protocol === 'amqp:' || u.protocol === 'amqps:' ? 5672 : 5432);
    return { host: u.hostname, port: u.port ? parseInt(u.port) : defaultPort };
  } catch (e) {
    return null;
  }
}

function tryConnect(host, port, timeout = 1000) {
  return new Promise((resolve) => {
    if (!host || !port) return resolve(false);
    const net = require('net');
    const s = new net.Socket();
    let done = false;
    s.setTimeout(timeout);
    s.once('error', () => { if (!done) { done = true; s.destroy(); resolve(false); } });
    s.once('timeout', () => { if (!done) { done = true; s.destroy(); resolve(false); } });
    s.connect(port, host, () => { if (!done) { done = true; s.end(); resolve(true); } });
  });
}

async function startNest() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.TCP,
    options: { host: '0.0.0.0', port: parseInt(process.env.PORT) || 3003 },
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.useGlobalFilters(new AllExceptionsFilter(logger));
  await app.listen();
  logger.info('📧 Notification Service microservice listening');
}

async function startHealthAndMetrics() {
  const http = require('http');

  const HEALTH_PORT = parseInt(process.env.HEALTH_PORT) || 3004;
  const METRICS_PORT = parseInt(process.env.METRICS_PORT) || 9400;
  const METRICS_BIND_ADDR = process.env.METRICS_BIND_ADDR || '127.0.0.1';
  const METRICS_POLL_INTERVAL = parseInt(process.env.METRICS_POLL_INTERVAL_MS) || 10000;

  const promClient = safeRequire('prom-client');
  if (promClient) {
    try {
      if (promClient.collectDefaultMetrics) promClient.collectDefaultMetrics();
    } catch (e) {
      logger.warn('prom-client default metrics failed:', e?.message || e);
    }
  }

  const queueGauge = promClient ? new promClient.Gauge({ name: 'notification_queue_length', help: 'Length of notification queue', labelNames: ['queue'] }) : null;
  const queueScrapeErrors = promClient ? new promClient.Counter({ name: 'notification_queue_scrape_errors_total', help: 'Total errors while scraping notification queue', labelNames: ['queue'] }) : null;

  async function updateQueueLength() {
    if (!queueGauge) return;
    try {
      if (process.env.REDIS_URL) {
        const IORedis = safeRequire('ioredis');
        if (IORedis) {
          const client = new IORedis(process.env.REDIS_URL, { connectTimeout: 2000 });
          try {
            let len = 0;
            if (process.env.NOTIFICATION_QUEUE_NAME) {
              len = await client.llen(process.env.NOTIFICATION_QUEUE_NAME).catch(() => null);
            }
            queueGauge.set({ queue: process.env.NOTIFICATION_QUEUE_NAME || 'default' }, typeof len === 'number' ? len : 0);
          } catch (e) {
            queueScrapeErrors && queueScrapeErrors.inc({ queue: process.env.NOTIFICATION_QUEUE_NAME || 'default' });
          }
          try { await client.quit().catch(() => null); } catch (e) { }
          return;
        }

        const redis = safeRequire('redis');
        if (redis) {
          const client = redis.createClient({ url: process.env.REDIS_URL });
          try {
            await client.connect();
            let len = 0;
            if (process.env.NOTIFICATION_QUEUE_NAME) {
              len = await client.llen(process.env.NOTIFICATION_QUEUE_NAME).catch(() => null);
            }
            queueGauge.set({ queue: process.env.NOTIFICATION_QUEUE_NAME || 'default' }, typeof len === 'number' ? len : 0);
          } catch (e) {
            queueScrapeErrors && queueScrapeErrors.inc({ queue: process.env.NOTIFICATION_QUEUE_NAME || 'default' });
          }
          try { await client.disconnect().catch(() => null); } catch (e) { }
          return;
        }

        // fallback TCP probe
        const r = parseUrlHostPort(process.env.REDIS_URL) || {};
        const up = await tryConnect(r.host, r.port || 6379);
        if (up) {
          queueGauge.set({ queue: process.env.NOTIFICATION_QUEUE_NAME || 'default' }, 0);
        } else {
          queueScrapeErrors && queueScrapeErrors.inc({ queue: process.env.NOTIFICATION_QUEUE_NAME || 'default' });
        }
        return;
      }

      if (process.env.RABBITMQ_URL) {
        const amqp = safeRequire('amqplib');
        if (amqp) {
          try {
            const conn = await amqp.connect(process.env.RABBITMQ_URL, { timeout: 2000 });
            const ch = await conn.createChannel();
            if (process.env.NOTIFICATION_QUEUE_NAME) {
              try {
                const info = await ch.checkQueue(process.env.NOTIFICATION_QUEUE_NAME);
                queueGauge.set({ queue: process.env.NOTIFICATION_QUEUE_NAME || 'default' }, typeof info?.messageCount === 'number' ? info.messageCount : 0);
              } catch (e) {
                queueScrapeErrors && queueScrapeErrors.inc({ queue: process.env.NOTIFICATION_QUEUE_NAME || 'default' });
              }
            }
            try { await ch.close().catch(() => null); await conn.close().catch(() => null); } catch (e) { }
          } catch (e) {
            queueScrapeErrors && queueScrapeErrors.inc({ queue: process.env.NOTIFICATION_QUEUE_NAME || 'default' });
          }
          return;
        }

        const r = parseUrlHostPort(process.env.RABBITMQ_URL) || {};
        const up = await tryConnect(r.host, r.port || 5672);
        if (!up) queueScrapeErrors && queueScrapeErrors.inc({ queue: process.env.NOTIFICATION_QUEUE_NAME || 'default' });
        return;
      }
    } catch (e) {
      queueScrapeErrors && queueScrapeErrors.inc({ queue: process.env.NOTIFICATION_QUEUE_NAME || 'default' });
    }
  }

  if (queueGauge) {
    await updateQueueLength().catch(() => null);
    setInterval(() => updateQueueLength().catch(() => null), METRICS_POLL_INTERVAL);

    // start metrics server
    try {
      const metricsServer = http.createServer(async (req, res) => {
        if (req.url === '/metrics') {
          res.writeHead(200, { 'Content-Type': promClient.register.contentType });
          res.end(await promClient.register.metrics());
          return;
        }
        res.writeHead(404);
        res.end();
      });
      metricsServer.listen(METRICS_PORT, METRICS_BIND_ADDR, () => logger.info(`📊 Metrics endpoint listening on ${METRICS_BIND_ADDR}:${METRICS_PORT}`));
    } catch (e) {
      logger.warn('Metrics server not started:', e?.message || e);
    }
  }

  // health server
  const server = http.createServer(async (req, res) => {
    if (req.url !== '/healthz') {
      res.writeHead(404);
      res.end();
      return;
    }

    const components = { service: 'notification-service' };
    let ok = true;

    // DB check (Prisma preferred)
    try {
      if (process.env.DATABASE_URL) {
        const Prisma = safeRequire('@prisma/client');
        if (Prisma && Prisma.PrismaClient) {
          const prisma = new Prisma.PrismaClient();
          try {
            await prisma.$queryRaw`SELECT 1`;
            components.db = 'ok';
          } catch (e) {
            components.db = 'error'; ok = false;
          }
          try { await prisma.$disconnect(); } catch (e) { }
        } else {
          const db = parseUrlHostPort(process.env.DATABASE_URL) || {};
          const up = await tryConnect(db.host, db.port);
          components.db = up ? 'ok' : 'error';
          if (!up) ok = false;
        }
      } else {
        components.db = 'not-configured';
      }
    } catch (e) {
      components.db = 'error'; ok = false;
    }

    // Queue check
    try {
      if (process.env.REDIS_URL) {
        components.queue = { status: 'unknown', len: null };
        const IORedis = safeRequire('ioredis');
        if (IORedis) {
          const client = new IORedis(process.env.REDIS_URL, { connectTimeout: 1000 });
          try {
            await client.ping();
            components.queue.status = 'ok';
            if (process.env.NOTIFICATION_QUEUE_NAME) {
              const len = await client.llen(process.env.NOTIFICATION_QUEUE_NAME).catch(() => null);
              components.queue.len = typeof len === 'number' ? len : null;
            }
          } catch (e) {
            components.queue.status = 'error'; ok = false;
          }
          try { await client.quit().catch(() => null); } catch (e) { }
        } else {
          const redis = safeRequire('redis');
          if (redis) {
            const client = redis.createClient({ url: process.env.REDIS_URL });
            try {
              await client.connect();
              await client.ping();
              components.queue.status = 'ok';
              if (process.env.NOTIFICATION_QUEUE_NAME) {
                const len = await client.llen(process.env.NOTIFICATION_QUEUE_NAME).catch(() => null);
                components.queue.len = typeof len === 'number' ? len : null;
              }
            } catch (e) {
              components.queue.status = 'error'; ok = false;
            }
            try { await client.disconnect().catch(() => null); } catch (e) { }
          } else {
            const r = parseUrlHostPort(process.env.REDIS_URL) || {};
            const up = await tryConnect(r.host, r.port || 6379);
            components.queue.status = up ? 'ok' : 'error';
            if (!up) ok = false;
          }
        }
      } else if (process.env.RABBITMQ_URL) {
        components.queue = { status: 'unknown', len: null };
        const amqp = safeRequire('amqplib');
        if (amqp) {
          try {
            const conn = await amqp.connect(process.env.RABBITMQ_URL, { timeout: 1000 });
            const ch = await conn.createChannel();
            if (process.env.NOTIFICATION_QUEUE_NAME) {
              try {
                const info = await ch.checkQueue(process.env.NOTIFICATION_QUEUE_NAME);
                components.queue.status = 'ok';
                components.queue.len = typeof info?.messageCount === 'number' ? info.messageCount : null;
              } catch (e) {
                components.queue.status = 'ok';
              }
            } else {
              components.queue.status = 'ok';
            }
            try { await ch.close().catch(() => null); } catch (e) { }
            try { await conn.close().catch(() => null); } catch (e) { }
          } catch (e) {
            const r = parseUrlHostPort(process.env.RABBITMQ_URL) || {};
            const up = await tryConnect(r.host, r.port || 5672);
            components.queue.status = up ? 'ok' : 'error';
            if (!up) ok = false;
          }
        } else {
          const r = parseUrlHostPort(process.env.RABBITMQ_URL) || {};
          const up = await tryConnect(r.host, r.port || 5672);
          components.queue.status = up ? 'ok' : 'error';
          if (!up) ok = false;
        }
      } else {
        components.queue = { status: 'not-configured', len: null };
      }
    } catch (e) {
      components.queue = { status: 'error', len: null };
      ok = false;
    }

    res.writeHead(ok ? 200 : 503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: ok ? 'ok' : 'error', components }));
  });

  server.listen(HEALTH_PORT, () => logger.info(`🩺 Notification health endpoint listening on ${HEALTH_PORT}`));
}

async function main() {
  try {
    await startNest();
  } catch (e) {
    logger.warn('Nest microservice failed to start:', e?.message || e);
  }

  try {
    await startHealthAndMetrics();
  } catch (e) {
    logger.warn('Health/metrics failed to start:', e?.message || e);
  }
}

main();