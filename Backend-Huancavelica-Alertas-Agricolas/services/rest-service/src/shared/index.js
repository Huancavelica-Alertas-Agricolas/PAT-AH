"use strict";
// Comentarios añadidos en español: re-export del `PrismaService` desde `shared/prisma`.
// Cómo lo logra: importa `./prisma/prisma.service` y vuelve a exportar `PrismaService` para uso centralizado.
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
var prisma_service_1 = require("./prisma/prisma.service");
Object.defineProperty(exports, "PrismaService", { enumerable: true, get: function () { return prisma_service_1.PrismaService; } });

// Re-exports for other shared utilities can be added here in future.
