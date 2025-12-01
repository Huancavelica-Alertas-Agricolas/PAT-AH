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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const auth_service_1 = require("./auth.service");
const auth_payload_dto_1 = require("./dto/auth-payload.dto");
const register_input_1 = require("./dto/register.input");
const prisma_service_1 = require("../prisma.service");
const sms_service = require("../../../shared/sms.service");
const bcrypt = require('bcryptjs');
let AuthResolver = class AuthResolver {
    constructor(authService, prisma) {
        this.authService = authService;
        this.prisma = prisma;
    }
    async register(input) {
        const res = await this.authService.register(input);
        return res;
    }
    async login(phone, password) {
        const res = await this.authService.login(phone, password);
        return res;
    }
    
    async recoverPassword(identifier, method) {
        try {
            const user = await this.prisma.user.findFirst({
                where: {
                    OR: [
                        { telefono: identifier },
                        { email: identifier },
                    ],
                },
            });

            if (!user) {
                return false;
            }

            const code = sms_service.generateVerificationCode();
            const expiraEn = new Date(Date.now() + 10 * 60 * 1000);

            await this.prisma.verificationCode.create({
                data: {
                    codigo: code,
                    tipo: method,
                    expiraEn,
                    userId: user.id,
                },
            });

            if (method === 'sms') {
                await sms_service.sendVerificationCode(user.telefono, code);
            }

            return true;
        } catch (error) {
            console.error('Error in recoverPassword:', error);
            return false;
        }
    }

    async verifyCode(phone, code) {
        try {
            const user = await this.prisma.user.findFirst({
                where: { telefono: phone },
            });

            if (!user) return false;

            const verificationCode = await this.prisma.verificationCode.findFirst({
                where: {
                    userId: user.id,
                    codigo: code,
                    usado: false,
                    expiraEn: {
                        gte: new Date(),
                    },
                },
            });

            if (!verificationCode) return false;

            await this.prisma.verificationCode.update({
                where: { id: verificationCode.id },
                data: { usado: true },
            });

            return true;
        } catch (error) {
            console.error('Error in verifyCode:', error);
            return false;
        }
    }

    async resetPassword(token, newPassword) {
        try {
            const user = await this.prisma.user.findFirst({
                where: { telefono: token },
            });

            if (!user) return false;

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await this.prisma.user.update({
                where: { id: user.id },
                data: { password: hashedPassword },
            });

            await this.prisma.verificationCode.updateMany({
                where: { userId: user.id },
                data: { usado: true },
            });

            return true;
        } catch (error) {
            console.error('Error in resetPassword:', error);
            return false;
        }
    }
};
exports.AuthResolver = AuthResolver;
__decorate([
    (0, graphql_1.Mutation)(() => auth_payload_dto_1.AuthPayload, { name: 'register' }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_input_1.RegisterInput]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "register", null);
__decorate([
    (0, graphql_1.Mutation)(() => auth_payload_dto_1.AuthPayload, { name: 'login' }),
    __param(0, (0, graphql_1.Args)('phone')),
    __param(1, (0, graphql_1.Args)('password')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "login", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { name: 'recoverPassword' }),
    __param(0, (0, graphql_1.Args)('identifier')),
    __param(1, (0, graphql_1.Args)('method')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "recoverPassword", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { name: 'verifyCode' }),
    __param(0, (0, graphql_1.Args)('phone')),
    __param(1, (0, graphql_1.Args)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "verifyCode", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { name: 'resetPassword' }),
    __param(0, (0, graphql_1.Args)('token')),
    __param(1, (0, graphql_1.Args)('newPassword')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "resetPassword", null);
exports.AuthResolver = AuthResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService, prisma_service_1.PrismaService])
], AuthResolver);
//# sourceMappingURL=auth.resolver.js.map