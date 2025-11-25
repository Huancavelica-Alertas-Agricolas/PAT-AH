"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
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
    await app.listen(process.env.PORT || 3003);
}
bootstrap();
//# sourceMappingURL=main.js.map