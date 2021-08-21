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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestResetPasswordResolver = void 0;
const User_1 = require("../../entity/User");
const type_graphql_1 = require("type-graphql");
const ObjectTypes_1 = require("./ObjectTypes");
const uuid_1 = require("uuid");
const constants_1 = require("../../constants");
const utils_1 = require("../../utils");
let RequestResetPasswordResolver = class RequestResetPasswordResolver {
    requestRestPassword(email, { redis }) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.User.findOne({ where: { email } });
            if (typeof user !== "undefined") {
                const token = constants_1.__reset__password__prefix + uuid_1.v4() + uuid_1.v4();
                const message = `<h1>Hello</h1><p>Please click <a href="http://localhost:300/confirm/user/${token}">here</a> to reset your password.`;
                yield utils_1.sendEmail(email, message, "reset password");
                yield redis.setex(token, constants_1.__maxAge__, user.id);
                return {
                    message: "the reset link has been sent to your email",
                };
            }
            else {
                return {
                    error: {
                        message: "could not find the user with that email",
                        field: "email",
                    },
                };
            }
        });
    }
};
__decorate([
    type_graphql_1.Mutation(() => ObjectTypes_1.ResetObjectType),
    __param(0, type_graphql_1.Arg("email", () => String)),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RequestResetPasswordResolver.prototype, "requestRestPassword", null);
RequestResetPasswordResolver = __decorate([
    type_graphql_1.Resolver()
], RequestResetPasswordResolver);
exports.RequestResetPasswordResolver = RequestResetPasswordResolver;
//# sourceMappingURL=RequestResetPassword.js.map