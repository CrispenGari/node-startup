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
exports.LoginResolver = void 0;
const User_1 = require("../../entity/User");
const type_graphql_1 = require("type-graphql");
const Inputs_1 = require("./Inputs");
const ObjectTypes_1 = require("./ObjectTypes");
const argon2_1 = __importDefault(require("argon2"));
let LoginResolver = class LoginResolver {
    login({ usernameOrEmail, password }, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const thisIsEmail = isEmail(usernameOrEmail);
            let user;
            if (thisIsEmail) {
                user = yield User_1.User.findOne({
                    where: {
                        email: usernameOrEmail,
                    },
                });
            }
            else {
                user = yield User_1.User.findOne({
                    where: {
                        username: usernameOrEmail,
                    },
                });
            }
            if (user) {
                const correct = yield argon2_1.default.verify(user.password, password);
                if (correct) {
                    req.session.userId = user.id;
                    user.isLoggedIn = true;
                    return {
                        user: yield user.save(),
                    };
                }
                else {
                    return {
                        error: {
                            message: `incorrect password.`,
                            field: `password`,
                        },
                    };
                }
            }
            else {
                return {
                    error: {
                        message: `the ${thisIsEmail ? "email" : "username"} does not exists.`,
                        field: `${thisIsEmail ? "email" : "username"}`,
                    },
                };
            }
        });
    }
};
__decorate([
    type_graphql_1.Mutation(() => ObjectTypes_1.UserObjectType, { nullable: true }),
    __param(0, type_graphql_1.Arg("input", () => Inputs_1.LoginInput)),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Inputs_1.LoginInput, Object]),
    __metadata("design:returntype", Promise)
], LoginResolver.prototype, "login", null);
LoginResolver = __decorate([
    type_graphql_1.Resolver()
], LoginResolver);
exports.LoginResolver = LoginResolver;
const isEmail = (email) => /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email);
//# sourceMappingURL=Login.js.map