"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
// Helper: normalize phone numbers to digits-only and prefer local 9-digit format
function normalizePhone(input) {
    if (!input) return '';
    // keep digits only
    const digits = input.toString().replace(/\D/g, '');
    if (digits.length <= 9) return digits;
    // if it ends with 9 digits, return last 9 digits (strip country code)
    return digits.slice(-9);
}
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../shared");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    // Normalize phone to digits-only and remove Peru country code if present
    // e.g. '+51904031408' -> '904031408', '51904031408' -> '904031408'
    // Keep only last 9 digits when longer than 9.
    
    
    
    
    async create(data) {
        // Normalize telefono before creating (store consistent format)
        if (data && data.telefono) {
            data.telefono = normalizePhone(data.telefono);
        }
        return this.prisma.user.create({ data });
    }
    async findByPhone(phone) {
        const p = normalizePhone(phone || '');
        return this.prisma.user.findUnique({ where: { telefono: p } });
    }
    async findAll() {
        return this.prisma.user.findMany();
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map