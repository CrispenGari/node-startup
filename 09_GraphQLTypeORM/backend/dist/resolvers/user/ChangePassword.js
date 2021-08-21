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
exports.ChangePasswordResolver = void 0;
const type_graphql_1 = require("type-graphql");
const ObjectTypes_1 = require("./ObjectTypes");
const User_1 = require("../../entity/User");
const argon2_1 = __importDefault(require("argon2"));
let ChangePasswordResolver = class ChangePasswordResolver {
    resetPassword({ redis }, token, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = yield redis.get(token);
            if (userId === null) {
                return {
                    error: {
                        message: "could not find the token maybe it has expired.",
                        field: "token",
                    },
                };
            }
            else {
                yield redis.del(token);
                const user = yield User_1.User.findOne({ where: { id: parseInt(userId, 10) } });
                if (typeof user === "undefined") {
                    return {
                        error: {
                            message: "the user could not be found.",
                            field: "token",
                        },
                    };
                }
                else {
                    user.password = yield argon2_1.default.hash(password);
                    yield user.save();
                    return {
                        message: "your password was reset please login again.",
                    };
                }
            }
        });
    }
};
__decorate([
    type_graphql_1.Mutation(() => ObjectTypes_1.ResetObjectType),
    __param(0, type_graphql_1.Ctx()),
    __param(1, type_graphql_1.Arg("token", () => String)),
    __param(2, type_graphql_1.Arg("password", () => String)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ChangePasswordResolver.prototype, "resetPassword", null);
ChangePasswordResolver = __decorate([
    type_graphql_1.Resolver()
], ChangePasswordResolver);
exports.ChangePasswordResolver = ChangePasswordResolver;
//# sourceMappingURL=ChangePassword.js.map