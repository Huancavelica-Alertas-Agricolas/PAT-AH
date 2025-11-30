const { ValidationPipe } = require('@nestjs/common');
const { AllExceptionsFilter } = require('./all-exceptions.filter');
const { NestFactory } = require('@nestjs/core');
const { Transport } = require('@nestjs/microservices');
const { AppModule } = require('./app.module');
const logger = require('./logger');
    // Prometheus metrics (require safely).
    let promClient = null;
    try {
      promClient = require('prom-client');
    }
    catch (e) {
      promClient = null;
    }
    if (promClient) {
      try {
        promClient.collectDefaultMetrics && promClient.collectDefaultMetrics();
      }
      catch (e) {
        console.warn('prom-client collectDefaultMetrics failed:', e?.message || e);
      }
    }
    const queueGauge = promClient ? new promClient.Gauge({ name: 'notification_queue_length', help: 'Length of notification queue', labelNames: ['queue'] }) : null;
    const queueScrapeErrors = promClient ? new promClient.Counter({ name: 'notification_queue_scrape_errors_total', help: 'Total errors while scraping notification queue', labelNames: ['queue'] }) : null;
    // Metrics server config
    const METRICS_PORT = parseInt(process.env.METRICS_PORT) || 9400;
    const METRICS_BIND_ADDR = process.env.METRICS_BIND_ADDR || '127.0.0.1';
    const METRICS_POLL_INTERVAL = parseInt(process.env.METRICS_POLL_INTERVAL_MS) || 10000;

    // Poller to update queue length periodically (so metrics are fresh for Prometheus)
    const updateQueueLength = async () => {
      if (!queueGauge) return;
      try {
        if (process.env.REDIS_URL) {
          try {
            const IORedis = require('ioredis');
            const client = new IORedis(process.env.REDIS_URL, { connectTimeout: 2000 });
            let len = null;
            if (process.env.NOTIFICATION_QUEUE_NAME) {
              len = await client.llen(process.env.NOTIFICATION_QUEUE_NAME).catch(() => null);
            }
            await client.quit().catch(() => null);
            const val = typeof len === 'number' ? len : 0;
            queueGauge.set({ queue: process.env.NOTIFICATION_QUEUE_NAME || 'default' }, val);
            return;
          }
          catch (e) {
            // fallback to node-redis if ioredis fails
            try {
              const redis = require('redis');
              const client = redis.createClient({ url: process.env.REDIS_URL });
              await client.connect();
              let len = null;
              if (process.env.NOTIFICATION_QUEUE_NAME) {
                len = await client.llen(process.env.NOTIFICATION_QUEUE_NAME).catch(() => null);
              }
              await client.disconnect().catch(() => null);
              const val = typeof len === 'number' ? len : 0;
              queueGauge.set({ queue: process.env.NOTIFICATION_QUEUE_NAME || 'default' }, val);
              return;
            }
            catch (e2) {
              // failed to read redis
              queueScrapeErrors && queueScrapeErrors.inc({ queue: process.env.NOTIFICATION_QUEUE_NAME || 'default' });
              return;
            }
          }
        }
        else if (process.env.RABBITMQ_URL) {
          try {
            const amqp = require('amqplib');
            const conn = await amqp.connect(process.env.RABBITMQ_URL, { timeout: 2000 });
            const ch = await conn.createChannel();
            if (process.env.NOTIFICATION_QUEUE_NAME) {
              try {
                const info = await ch.checkQueue(process.env.NOTIFICATION_QUEUE_NAME);
                const val = typeof info?.messageCount === 'number' ? info.messageCount : 0;
                queueGauge.set({ queue: process.env.NOTIFICATION_QUEUE_NAME || 'default' }, val);
              }
              catch (e) {
                queueScrapeErrors && queueScrapeErrors.inc({ queue: process.env.NOTIFICATION_QUEUE_NAME || 'default' });
              }
            }
            await ch.close().catch(() => null);
            await conn.close().catch(() => null);
            return;
          }
          catch (e) {
            queueScrapeErrors && queueScrapeErrors.inc({ queue: process.env.NOTIFICATION_QUEUE_NAME || 'default' });
            return;
          }
        }
      }
      catch (e) {
        queueScrapeErrors && queueScrapeErrors.inc({ queue: process.env.NOTIFICATION_QUEUE_NAME || 'default' });
      }
    };

    // Start polling if metrics enabled
    if (queueGauge) {
      // initial poll
      updateQueueLength().catch(() => null);
      setInterval(() => updateQueueLength().catch(() => null), METRICS_POLL_INTERVAL);
      // start metrics HTTP server on separate port
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
        metricsServer.listen(METRICS_PORT, METRICS_BIND_ADDR, () => {
          logger.info(`📊 Metrics endpoint listening on ${METRICS_BIND_ADDR}:${METRICS_PORT}`);
        });
      }
      catch (e) {
        logger.warn('Metrics server not started:', e?.message || e);
      }
    }
        // Queue check (Redis or RabbitMQ)
        try {
          // Normalize components.queue to an object when configured
          if (process.env.REDIS_URL) {
        components.queue = { status: 'unknown', len: null };
            // Prefer deeper Redis check if client library available
            try {
              // Try ioredis first
              try {
                const IORedis = require('ioredis');
                const client = new IORedis(process.env.REDIS_URL, { connectTimeout: 1000 });
                await client.ping();
                components.queue.status = 'ok';
                if (process.env.NOTIFICATION_QUEUE_NAME) {
                  const len = await client.llen(process.env.NOTIFICATION_QUEUE_NAME).catch(() => null);
                  components.queue.len = typeof len === 'number' ? len : null;
                }
                try { await client.quit(); } catch (_) { }
              }
              catch (e) {
                // Try node-redis
                const redis = require('redis');
                const client = redis.createClient({ url: process.env.REDIS_URL });
                await client.connect();
                await client.ping();
                components.queue.status = 'ok';
                if (process.env.NOTIFICATION_QUEUE_NAME) {
                  const len = await client.llen(process.env.NOTIFICATION_QUEUE_NAME).catch(() => null);
                  components.queue.len = typeof len === 'number' ? len : null;
                }
                try { await client.disconnect(); } catch (_) { }
              }
            }
            catch (e) {
              // Redis client not available or failed — fallback to TCP probe
            }

                if (components.queue.status === 'unknown') {
              const r = parseUrlHostPort(process.env.REDIS_URL);
              const up = await tryConnect(r?.host, r?.port || 6379);
              components.queue.status = up ? 'ok' : 'error';
              if (!up) ok = false;
            }
            // update prometheus gauge if available
            try {
              if (queueGauge) {
                const lenVal = typeof components.queue.len === 'number' ? components.queue.len : 0;
                queueGauge.set(lenVal);
              }
            }
            catch (e) { }
          }
          else if (process.env.RABBITMQ_URL) {
            components.queue = { status: 'unknown', len: null };
            // Prefer amqplib check if available
            try {
              const amqp = require('amqplib');
              const conn = await amqp.connect(process.env.RABBITMQ_URL, { timeout: 1000 });
              const ch = await conn.createChannel();
              if (process.env.NOTIFICATION_QUEUE_NAME) {
                try {
                  const info = await ch.checkQueue(process.env.NOTIFICATION_QUEUE_NAME);
                  components.queue.status = 'ok';
                  components.queue.len = typeof info?.messageCount === 'number' ? info.messageCount : null;
                }
                catch (e) {
                  // queue might not exist or check failed
                  components.queue.status = 'ok';
                }
              }
              else {
                components.queue.status = 'ok';
              }
              try { await ch.close(); } catch (_) { }
              try { await conn.close(); } catch (_) { }
            }
            catch (e) {
              // amqplib not present or failed — fallback to TCP probe
              const r = parseUrlHostPort(process.env.RABBITMQ_URL);
              const up = await tryConnect(r?.host, r?.port || 5672);
              components.queue.status = up ? 'ok' : 'error';
              if (!up) ok = false;
            }
          }
          else {
            components.queue = { status: 'not-configured', len: null };
          }
        }
        catch (e) {
          components.queue = { status: 'error', len: null };
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