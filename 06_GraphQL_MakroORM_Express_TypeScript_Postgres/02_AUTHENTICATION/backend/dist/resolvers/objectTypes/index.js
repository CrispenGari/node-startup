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
exports.Email = exports.UserResponse = exports.Error = void 0;
const User_1 = require("../../entities/User");
const type_graphql_1 = require("type-graphql");
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
exports.Error = Error;
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
exports.UserResponse = UserResponse;
let Email = class Email {
};
__decorate([
    type_graphql_1.Field(() => Error, { nullable: true }),
    __metadata("design:type", Error)
], Email.prototype, "error", void 0);
__decorate([
    type_graphql_1.Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], Email.prototype, "message", void 0);
Email = __decorate([
    type_graphql_1.ObjectType()
], Email);
exports.Email = Email;
//# sourceMappingURL=index.js.map