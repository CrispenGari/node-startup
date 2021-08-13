"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Todo_1 = require("./entities/Todo");
const path_1 = __importDefault(require("path"));
exports.default = {
    entities: [Todo_1.Todo],
    migrations: {
        path: path_1.default.join(__dirname, "./migrations"),
        pattern: /^[\w-]+\d+\.[t|j]s$/,
    },
    dbName: "todo",
    password: "root",
    user: "postgres",
    port: 5432,
    debug: process.env.NODE_ENV !== "production",
    type: "postgresql",
};
//# sourceMappingURL=mikro-orm.config.js.map