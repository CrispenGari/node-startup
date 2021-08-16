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
exports.UserResolver = void 0;
const type_graphql_1 = require("type-graphql");
const User_1 = require("../entities/User");
const argon2_1 = __importDefault(require("argon2"));
let UserInput = class UserInput {
};
__decorate([
    type_graphql_1.Field(() => String),
    __metadata("design:type", String)
], UserInput.prototype, "username", void 0);
__decorate([
    type_graphql_1.Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], UserInput.prototype, "email", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    __metadata("design:type", String)
], UserInput.prototype, "password", void 0);
UserInput = __decorate([
    type_graphql_1.InputType()
], UserInput);
let Error = class Error {
};
__decorate([
    type_graphql_1.Field(() => String),
    __metadata("design:type", String)
], Error.prototype, "name", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    __metadata("design:type", String)
], Error.prototype, "message", void 0);
Error = __decorate([
    type_graphql_1.ObjectType()
], Error);
let UserResponse = class UserResponse {
};
__decorate([
    type_graphql_1.Field(() => User_1.User, { nullable: true }),
    __metadata("design:type", User_1.User)
], UserResponse.prototype, "user", void 0);
__decorate([
    type_graphql_1.Field(() => Error, { nullable: true }),
    __metadata("design:type", Error)
], UserResponse.prototype, "error", void 0);
UserResponse = __decorate([
    type_graphql_1.ObjectType()
], UserResponse);
let UserResolver = class UserResolver {
    user({ em, req }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.session.userId) {
                return null;
            }
            const user = yield em.findOne(User_1.User, {
                id: req.session.userId,
            });
            return user;
        });
    }
    register({ em, req }, user) {
        return __awaiter(this, void 0, void 0, function* () {
            if (user.username.length <= 3) {
                return {
                    error: {
                        message: "username must have at least 3 characters",
                        name: "username",
                    },
                };
            }
            if (user.password.length <= 3) {
                return {
                    error: {
                        message: "password must have at least 3 characters",
                        name: "password",
                    },
                };
            }
            const hashed = yield argon2_1.default.hash(user.password);
            const _user = em.create(User_1.User, {
                email: user.email.toLocaleLowerCase(),
                password: hashed,
                username: user.username.toLocaleLowerCase(),
            });
            try {
                yield em.persistAndFlush(_user);
            }
            catch (error) {
                if (error.code === "23505" ||
                    String(error.detail).includes("already exists")) {
                    return {
                        error: {
                            message: "username is taken by someone else",
                            name: "username",
                        },
                    };
                }
            }
            req.session.userId = _user.id;
            return { user: _user };
        });
    }
    login({ em, req }, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const _userFound = yield em.findOne(User_1.User, {
                username: user.username.toLocaleLowerCase(),
            });
            if (!_userFound) {
                return {
                    error: {
                        message: "username does not exists",
                        name: "username",
                    },
                };
            }
            const compare = yield argon2_1.default.verify(_userFound === null || _userFound === void 0 ? void 0 : _userFound.password, user === null || user === void 0 ? void 0 : user.password);
            if (!Boolean(compare)) {
                return {
                    error: {
                        name: "password",
                        message: "invalid password",
                    },
                };
            }
            else {
                req.session.userId = _userFound.id;
                return { user: _userFound };
            }
        });
    }
    logout({ req, res }) {
        return new Promise((resolved, rejection) => {
            req.session.destroy((error) => {
                res.clearCookie("user");
                if (error) {
                    return rejection(false);
                }
                return resolved(true);
            });
        });
    }
};
__decorate([
    type_graphql_1.Query(() => User_1.User, { nullable: true }),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "user", null);
__decorate([
    type_graphql_1.Mutation(() => UserResponse),
    __param(0, type_graphql_1.Ctx()),
    __param(1, type_graphql_1.Arg("user", () => UserInput, { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, UserInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "register", null);
__decorate([
    type_graphql_1.Mutation(() => UserResponse),
    __param(0, type_graphql_1.Ctx()),
    __param(1, type_graphql_1.Arg("user", () => UserInput, { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, UserInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "login", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "logout", null);
UserResolver = __decorate([
    type_graphql_1.Resolver()
], UserResolver);
exports.UserResolver = UserResolver;
//# sourceMappingURL=user.js.map