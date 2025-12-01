"use strict";
// Comentarios añadidos en español: archivo transpilado del REST controller.
// Cómo lo logra: expone rutas HTTP (`auth/login`, `me`, `users`, `weather`) y delega en `AuthService`/`UsersClient`/`weatherClient`.
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
exports.RestController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("../auth/auth.service");
const users_client_1 = require("../users/users.client");
const microservices_1 = require("@nestjs/microservices");
const { firstValueFrom } = require('rxjs');
let RestController = class RestController {
    constructor(authService, usersClient, weatherClient) {
        this.authService = authService;
        this.usersClient = usersClient;
        this.weatherClient = weatherClient;
    }
    async login(body) {
        const res = await this.authService.login(body.phone, body.password);
        if (!res)
            return { success: false, message: 'Invalid credentials' };
        return { success: true, token: res.token, user: res.user, timestamp: new Date() };
    }
    async me(req) {
        // Return decoded token payload attached by jwtMiddleware (if present)
        if (req.user)
            return { authenticated: true, user: req.user };
        return { authenticated: false };
    }
    async createUser(body) {
        // Delegate to AuthService.register so password is hashed consistently
        const res = await this.authService.register(body);
        if (!res)
            return { success: false, message: 'Could not create user' };
        return { success: true, user: res.user };
    }

    async listUsers() {
        // Proxy to users microservice client; return empty array on error
        try {
            const users = await this.usersClient.findAll();
            return users;
        }
        catch (e) {
            this.logger && this.logger.error && this.logger.error('Error listing users', e);
            return [];
        }
    }

    async getWeather() {
        // Request current weather data from the weather microservice via TCP client
        try {
            const obs = this.weatherClient.send('get_weather_data', {});
            const data = await (0, firstValueFrom)(obs);
            return data;
        }
        catch (e) {
            this.logger && this.logger.error && this.logger.error('Error fetching weather from microservice', e);
            return { error: 'Weather service unavailable' };
        }
    }
};
exports.RestController = RestController;
__decorate([
    (0, common_1.Post)('auth/login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RestController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RestController.prototype, "me", null);
__decorate([
    (0, common_1.Post)('users'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RestController.prototype, "createUser", null);

__decorate([
    (0, common_1.Get)('users'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RestController.prototype, "listUsers", null);

__decorate([
    (0, common_1.Get)('weather'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RestController.prototype, "getWeather", null);

// Alias route for compatibility
RestController.prototype.getWeatherCurrent = async function () {
    return await this.getWeather();
};

__decorate([
    (0, common_1.Get)('weather/current'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RestController.prototype, "getWeatherCurrent", null);
exports.RestController = RestController = __decorate([
    (0, common_1.Controller)(),
    __param(2, (0, common_1.Inject)('WEATHER_CLIENT')),
    __metadata("design:paramtypes", [auth_service_1.AuthService, users_client_1.UsersClient, Object])
], RestController);
//# sourceMappingURL=rest.controller.js.map