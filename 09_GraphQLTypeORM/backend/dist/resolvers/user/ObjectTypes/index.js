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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetObjectType = exports.UserObjectType = void 0;
const User_1 = require("../../../entity/User");
const type_graphql_1 = require("type-graphql");
let AuthError = class AuthError {
};
__decorate([
    type_graphql_1.Field(() => String),
    __metadata("design:type", String)
], AuthError.prototype, "field", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    __metadata("design:type", String)
], AuthError.prototype, "message", void 0);
AuthError = __decorate([
    type_graphql_1.ObjectType()
], AuthError);
let UserObjectType = class UserObjectType {
};
__decorate([
    type_graphql_1.Field(() => User_1.User, { nullable: true }),
    __metadata("design:type", User_1.User)
], UserObjectType.prototype, "user", void 0);
__decorate([
    type_graphql_1.Field(() => AuthError, { nullable: true }),
    __metadata("design:type", AuthError)
], UserObjectType.prototype, "error", void 0);
UserObjectType = __decorate([
    type_graphql_1.ObjectType()
], UserObjectType);
exports.UserObjectType = UserObjectType;
let ResetObjectType = class ResetObjectType {
};
__decorate([
    type_graphql_1.Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], ResetObjectType.prototype, "message", void 0);
__decorate([
    type_graphql_1.Field(() => AuthError, { nullable: true }),
    __metadata("design:type", AuthError)
], ResetObjectType.prototype, "error", void 0);
ResetObjectType = __decorate([
    type_graphql_1.ObjectType()
], ResetObjectType);
exports.ResetObjectType = ResetObjectType;
//# sourceMappingURL=index.js.map