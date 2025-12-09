"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const users_service_1 = require("./users.service");
const users_client_1 = require("./users.client");
const user_dto_1 = require("./dto/user.dto");
const update_user_input_1 = require("./dto/update-user.input");
let UsersResolver = class UsersResolver {
    constructor(usersService, usersClient) {
        this.usersService = usersService;
        this.usersClient = usersClient;
        this.useMicro = process.env.USE_USERS_MICROSERVICE === 'true';
    }
    async helloUsers() {
        var _a;
        const users = this.useMicro ? await this.usersClient.findAll() : await this.usersService.findAll();
        const len = Array.isArray(users) ? users.length : ((_a = users === null || users === void 0 ? void 0 : users.length) !== null && _a !== void 0 ? _a : 0);
        return `Users: ${len}`;
    }
    async updateUser(id, input) {
        const user = this.useMicro ? await this.usersClient.update(id, input) : await this.usersService.update(id, input);
        return user;
    }
};
exports.UsersResolver = UsersResolver;
__decorate([
    (0, graphql_1.Query)(() => String),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersResolver.prototype, "helloUsers", null);
__decorate([
    (0, graphql_1.Mutation)(() => user_dto_1.UserDto),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_input_1.UpdateUserInput]),
    __metadata("design:returntype", Promise)
], UsersResolver.prototype, "updateUser", null);
exports.UsersResolver = UsersResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [users_service_1.UsersService, users_client_1.UsersClient])
], UsersResolver);
//# sourceMappingURL=users.resolver.js.map