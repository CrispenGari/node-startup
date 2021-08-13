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
exports.Todo = void 0;
const core_1 = require("@mikro-orm/core");
const type_graphql_1 = require("type-graphql");
let Todo = class Todo {
    constructor() {
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
};
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int),
    core_1.PrimaryKey(),
    __metadata("design:type", Number)
], Todo.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    core_1.Property({ type: "date" }),
    __metadata("design:type", Object)
], Todo.prototype, "createdAt", void 0);
__decorate([
    type_graphql_1.Field(() => String),
    core_1.Property({ type: "date", onUpdate: () => new Date() }),
    __metadata("design:type", Object)
], Todo.prototype, "updatedAt", void 0);
__decorate([
    type_graphql_1.Field(),
    core_1.Property({ type: "text" }),
    __metadata("design:type", String)
], Todo.prototype, "title", void 0);
__decorate([
    type_graphql_1.Field(() => Boolean),
    core_1.Property({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], Todo.prototype, "completed", void 0);
Todo = __decorate([
    type_graphql_1.ObjectType(),
    core_1.Entity()
], Todo);
exports.Todo = Todo;
//# sourceMappingURL=Todo.js.map