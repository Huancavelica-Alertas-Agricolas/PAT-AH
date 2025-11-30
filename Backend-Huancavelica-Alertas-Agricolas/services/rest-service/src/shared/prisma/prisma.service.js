"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const client_1 = require("@prisma/client");
class PrismaService extends client_1.PrismaClient {
    constructor() {
        super();
    }
    async onModuleInit() {
        // Connect Prisma when Nest module initializes
        await this.$connect();
    }
    async enableShutdownHooks(app) {
        // Ensure Nest app is closed when Prisma emits beforeExit
        this.$on('beforeExit', async () => {
            await app.close();
        });
    }
    async onModuleDestroy() {
        // Graceful disconnect
        try {
            await this.$disconnect();
        }
        catch (e) {
            // ignore
        }
    }
}
exports.PrismaService = PrismaService;
//# sourceMappingURL=prisma.service.js.map