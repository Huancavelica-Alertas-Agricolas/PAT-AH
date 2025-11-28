"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestModule = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const rest_controller_1 = require("./rest.controller");
const auth_module_1 = require("../auth/auth.module");
const users_module_1 = require("../users/users.module");

// Client to communicate with weather microservice (TCP)
const { ClientsModule } = require('@nestjs/microservices');
let RestModule = class RestModule {
};
exports.RestModule = RestModule;
exports.RestModule = RestModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            // Register a TCP client to reach the weather microservice. Use env vars to allow
            // running on host (mapped port) or inside docker (service name + container port).
            ClientsModule.register([
                {
                    name: 'WEATHER_CLIENT',
                    transport: microservices_1.Transport.TCP,
                    options: {
                        host: process.env.WEATHER_HOST || '127.0.0.1',
                        port: parseInt(process.env.WEATHER_PORT || String(process.env.WEATHER_PORT || '3006'), 10) || 3006,
                    },
                },
            ]),
        ],
        controllers: [rest_controller_1.RestController],
    })
], RestModule);
//# sourceMappingURL=rest.module.js.map