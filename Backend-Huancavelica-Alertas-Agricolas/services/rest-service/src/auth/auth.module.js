"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const { ClientsModule, Transport } = require('@nestjs/microservices');
const auth_service_1 = require("./auth.service");
const auth_resolver_1 = require("./auth.resolver");
const users_module_1 = require("../users/users.module");
const shared_module_1 = require("../shared/shared.module");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            shared_module_1.SharedModule,
            users_module_1.UsersModule,
            // Cliente TCP para comunicación con notification-service (welcome emails / sms)
            ClientsModule.register([
                {
                    name: 'NOTIFICATION_SERVICE',
                    transport: Transport.TCP,
                    options: {
                        host: process.env.NOTIFICATION_SERVICE_HOST || 'notification-service',
                        port: parseInt(process.env.NOTIFICATION_SERVICE_PORT || String(process.env.NOTIFICATION_SERVICE_PORT || '3003'), 10) || 3003,
                    },
                },
            ]),
        ],
        providers: [auth_service_1.AuthService, auth_resolver_1.AuthResolver],
        exports: [auth_service_1.AuthService],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map