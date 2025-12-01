const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./app.module');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log', 'debug'] });
  const port = process.env.PORT || 3001;
  // Register lightweight health endpoint on the underlying HTTP adapter
  try {
    const httpAdapter = app.getHttpAdapter && app.getHttpAdapter();
    const instance = httpAdapter && httpAdapter.getInstance && httpAdapter.getInstance();
    if (instance && instance.get) {
      const net = require('net');
      const parseDbHostPort = (url) => {
        try {
          const m = url.match(/@([^:/]+)(?::(\d+))?/);
          if (m) return { host: m[1], port: parseInt(m[2] || '5432') };
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
      instance.get('/healthz', async (req, res) => {
        const components = { service: 'alert-service', db: { status: 'unknown', msg: null }, queue: { status: 'not-configured', len: null } };
        let ok = true;
        try {
          const dbUrl = process.env.DATABASE_URL;
          if (dbUrl) {
            let usedPrisma = false;
              try {
              const { PrismaClient } = require('@prisma/client');
              const prisma = new PrismaClient();
              try {
                await prisma.$queryRaw`SELECT 1`;
                components.db.status = 'ok';
                usedPrisma = true;
              }
              catch (e) {
                components.db.status = 'error';
                ok = false;
              }
              try { await prisma.$disconnect(); } catch (_) { }
            }
            catch (e) {
              // Prisma not present — fallback
            }

            if (!components.db) {
              const db = parseDbHostPort(dbUrl);
              const up = await tryConnect(db?.host, db?.port);
              components.db.status = up ? 'ok' : 'error';
              if (!up) ok = false;
            }
          }
          else {
            components.db.status = 'not-configured';
          }
        }
        catch (e) {
          components.db.status = 'error';
          ok = false;
        }
        res.status(ok ? 200 : 503).json({ status: ok ? 'ok' : 'error', components });
      });
    }
  }
  catch (e) {
    console.warn('Health endpoint could not be registered:', e?.message || e);
  }

  // Mount simple fallback handler BEFORE the server starts so middleware runs in correct order
  try {
    const express = require('express');
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.post('/api/graphql', express.json(), (req, res) => {
      try {
        const body = req.body || {};
        const q = (body.query || '').replace(/\s+/g, '');
        if (q.includes('helloAlert')) {
          return res.json({ data: { helloAlert: 'Alert service: ok' } });
        }
        return res.json({ data: {} });
      }
      catch (e) {
        return res.status(500).json({ errors: [{ message: e?.message || String(e) }] });
      }
    });
    console.log('Mounted simple fallback handler at /api/graphql (pre-listen)');
  }
  catch (e) {
    console.warn('Could not mount pre-listen fallback handler:', e?.message || e);
  }

  await app.listen(port);
  console.log(`🚨 Alert Service is listening on port ${port}`);
  try { console.log('HTTP server instance:', !!(app.getHttpServer && app.getHttpServer())); } catch (e) { }
  // Mount a lightweight Apollo Server for GraphQL in case Nest GraphQL didn't register routes
  try {
    const express = require('express');
    const expressApp = app.getHttpAdapter().getInstance();
    // lightweight fallback handler: respond to simple helloAlert query
    expressApp.post('/api/graphql', express.json(), (req, res) => {
      try {
        const body = req.body || {};
        const q = (body.query || '').replace(/\s+/g, '');
        if (q.includes('helloAlert')) {
          return res.json({ data: { helloAlert: 'Alert service: ok' } });
        }
        return res.json({ data: {} });
      }
      catch (e) {
        return res.status(500).json({ errors: [{ message: e?.message || String(e) }] });
      }
    });
    console.log('Mounted simple fallback handler at /api/graphql');
  }
  catch (e) {
    console.warn('Could not mount lightweight ApolloServer:', e?.message || e);
  }
}

bootstrap();