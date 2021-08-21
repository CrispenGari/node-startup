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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterResolver = void 0;
const User_1 = require("../../entity/User");
const type_graphql_1 = require("type-graphql");
const Inputs_1 = require("./Inputs");
const argon2_1 = __importDefault(require("argon2"));
const utils_1 = require("../../utils");
const constants_1 = require("../../constants");
const uuid_1 = require("uuid");
let RegisterResolver = class RegisterResolver {
    register(input, { redis }) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = constants_1.__confirm__email__prefix + uuid_1.v4() + uuid_1.v4();
            const message = `<h1>Hello</h1><p>Please click <a href="http://localhost:300/confirm/user/${token}">here</a> to confirm your account creation.`;
            yield utils_1.sendEmail(input.email, message, "confirm your email");
            const hashedPassword = yield argon2_1.default.hash(input.password);
            const user = yield User_1.User.create(Object.assign(Object.assign({}, input), { password: hashedPassword })).save();
            yield redis.setex(token, constants_1.__maxAge__, user.id);
            return user;
        });
    }
};
__decorate([
    type_graphql_1.Mutation(() => User_1.User),
    __param(0, type_graphql_1.Arg("input", () => Inputs_1.RegisterInput, { validate: true })),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Inputs_1.RegisterInput, Object]),
    __metadata("design:returntype", Promise)
], RegisterResolver.prototype, "register", null);
RegisterResolver = __decorate([
    type_graphql_1.Resolver()
], RegisterResolver);
exports.RegisterResolver = RegisterResolver;
//# sourceMappingURL=Register.js.map