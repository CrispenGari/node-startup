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
exports.DeleteAccountResolver = void 0;
const constants_1 = require("../../constants");
const User_1 = require("../../entity/User");
const type_graphql_1 = require("type-graphql");
let DeleteAccountResolver = class DeleteAccountResolver {
    deleteAccount({ req, res }) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof ((_a = req.session) === null || _a === void 0 ? void 0 : _a.userId) === "undefined") {
                return false;
            }
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                var _b;
                yield User_1.User.delete({ id: (_b = req.session) === null || _b === void 0 ? void 0 : _b.userId }).then(() => __awaiter(this, void 0, void 0, function* () {
                    var _c;
                    yield ((_c = req.session) === null || _c === void 0 ? void 0 : _c.destroy((err) => __awaiter(this, void 0, void 0, function* () {
                        res.clearCookie(constants_1.__cookieName__);
                        if (err) {
                            return reject(false);
                        }
                        else {
                            return resolve(true);
                        }
                    })));
                }));
            }));
        });
    }
};
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DeleteAccountResolver.prototype, "deleteAccount", null);
DeleteAccountResolver = __decorate([
    type_graphql_1.Resolver()
], DeleteAccountResolver);
exports.DeleteAccountResolver = DeleteAccountResolver;
//# sourceMappingURL=DeleteAccount.js.map