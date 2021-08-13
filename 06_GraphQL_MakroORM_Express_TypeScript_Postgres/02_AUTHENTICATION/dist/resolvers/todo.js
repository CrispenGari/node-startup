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
exports.TodoResolver = void 0;
const Todo_1 = require("../entities/Todo");
const type_graphql_1 = require("type-graphql");
let TodoResolver = class TodoResolver {
    todos(ctx) {
        return ctx.em.find(Todo_1.Todo, {});
    }
    todo(id, ctx) {
        return ctx.em.findOne(Todo_1.Todo, { id });
    }
    addTodo(title, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const todo = ctx.em.create(Todo_1.Todo, {
                title,
            });
            yield ctx.em.persistAndFlush(todo);
            return todo;
        });
    }
    deleteTodo(id, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            yield ctx.em.nativeDelete(Todo_1.Todo, { id });
            return true;
        });
    }
    updateTodo(title, id, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const todo = yield ctx.em.findOne(Todo_1.Todo, { id });
            if (!todo) {
                return null;
            }
            if (typeof title !== "undefined") {
                todo.title = title;
                yield ctx.em.persistAndFlush(todo);
            }
            return todo;
        });
    }
};
__decorate([
    type_graphql_1.Query(() => [Todo_1.Todo]),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TodoResolver.prototype, "todos", null);
__decorate([
    type_graphql_1.Query(() => Todo_1.Todo, { nullable: true }),
    __param(0, type_graphql_1.Arg("id", () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], TodoResolver.prototype, "todo", null);
__decorate([
    type_graphql_1.Mutation(() => Todo_1.Todo),
    __param(0, type_graphql_1.Arg("title")),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TodoResolver.prototype, "addTodo", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Arg("id", () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], TodoResolver.prototype, "deleteTodo", null);
__decorate([
    type_graphql_1.Mutation(() => Todo_1.Todo, { nullable: true }),
    __param(0, type_graphql_1.Arg("title", () => String, { nullable: true })),
    __param(1, type_graphql_1.Arg("id")),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Object]),
    __metadata("design:returntype", Promise)
], TodoResolver.prototype, "updateTodo", null);
TodoResolver = __decorate([
    type_graphql_1.Resolver()
], TodoResolver);
exports.TodoResolver = TodoResolver;
//# sourceMappingURL=todo.js.map