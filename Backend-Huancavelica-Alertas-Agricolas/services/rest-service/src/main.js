"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // Enable CORS so frontend (localhost:3000 / Vite) can call the REST API during development
    // Allow common local dev hosts and credentials for cookies/auth if needed
    try {
        app.enableCors({
            origin: [
                'http://localhost:3000',
                'http://127.0.0.1:3000',
                'http://localhost:5173',
                'http://127.0.0.1:5173',
                'http://pat-ah-frontend-876253813400-b67b5fbe.s3-website-us-east-1.amazonaws.com',
                'https://d3juc86eqmpfpd.cloudfront.net'
            ],
            methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
            credentials: true
        });
    }
    catch (e) {
        console.warn('Could not enable CORS:', e?.message || e);
    }

    // Register JWT middleware so `req.user` is populated when a valid token is provided
    try {
        const { jwtMiddleware } = require('./auth/jwt.middleware');
        app.use(jwtMiddleware);
    }
    catch (e) {
        // If middleware not available, continue without blocking startup
        console.warn('JWT middleware could not be registered:', e?.message || e);
    }
    app.enableShutdownHooks();
    app.setGlobalPrefix('api');
    // Health endpoint: lightweight check, safe if Prisma or other services not available
    try {
        const httpAdapter = app.getHttpAdapter && app.getHttpAdapter();
        const instance = httpAdapter && httpAdapter.getInstance && httpAdapter.getInstance();
        if (instance && instance.get) {
                const net = require('net');
                const parseDbHostPort = (url) => {
                    try {
                        // postgres://user:pass@host:port/db
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
                    const components = {};
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

    await app.listen(process.env.PORT || 3003);
}
bootstrap();
//# sourceMappingURL=main.js.map