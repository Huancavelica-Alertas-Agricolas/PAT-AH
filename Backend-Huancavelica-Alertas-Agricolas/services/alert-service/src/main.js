const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./app.module');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
        const components = { service: 'alert-service' };
        let ok = true;
        try {
          const dbUrl = process.env.DATABASE_URL;
          if (dbUrl) {
            const db = parseDbHostPort(dbUrl);
            const up = await tryConnect(db?.host, db?.port);
            components.db = up ? 'ok' : 'error';
            if (!up) ok = false;
          }
          else {
            components.db = 'not-configured';
          }
        }
        catch (e) {
          components.db = 'error';
          ok = false;
        }
        res.status(ok ? 200 : 503).json({ status: ok ? 'ok' : 'error', components });
      });
    }
  }
  catch (e) {
    console.warn('Health endpoint could not be registered:', e?.message || e);
  }

  await app.listen(port);
  console.log(`🚨 Alert Service is listening on port ${port}`);
}

bootstrap();