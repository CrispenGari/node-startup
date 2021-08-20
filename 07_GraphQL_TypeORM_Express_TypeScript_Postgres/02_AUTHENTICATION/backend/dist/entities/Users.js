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
exports.Users = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
let Users = class Users extends typeorm_1.BaseEntity {
};
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int),
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Users.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    typeorm_1.CreateDateColumn(),
    __metadata("design:type", Date)
], Users.prototype, "createdat", void 0);
__decorate([
    typeorm_1.Column({ type: "text", nullable: false }),
    __metadata("design:type", String)
], Users.prototype, "password", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    typeorm_1.Column({ type: "text", unique: true, nullable: false }),
    __metadata("design:type", String)
], Users.prototype, "username", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    typeorm_1.Column({ type: "text", nullable: false }),
    __metadata("design:type", String)
], Users.prototype, "email", void 0);
Users = __decorate([
    type_graphql_1.ObjectType(),
    typeorm_1.Entity()
], Users);
exports.Users = Users;
//# sourceMappingURL=Users.js.map