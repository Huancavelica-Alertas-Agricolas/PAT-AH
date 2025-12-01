"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    try {
        app.enableCors({
            origin: [
                'http://localhost:3000',
                'http://127.0.0.1:3000',
                'http://localhost:5173',
                'http://127.0.0.1:5173',
                'http://18.208.193.82:5173',
                'http://pat-ah-frontend-876253813400-b67b5fbe.s3-website-us-east-1.amazonaws.com',
                'https://d3juc86eqmpfpd.cloudfront.net'
            ],
            methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
            credentials: true
        });
    }
    catch (e) {
        console.warn('Could not enable CORS:', e === null || e === void 0 ? void 0 : e.message || e);
    }
    app.enableShutdownHooks();
    app.setGlobalPrefix('api');
    await app.listen(process.env.PORT || 3003);
}
bootstrap();
//# sourceMappingURL=main.js.map