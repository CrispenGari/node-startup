"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeORMConfig = void 0;
const path_1 = __importDefault(require("path"));
const Todo_1 = require("./entities/Todo");
exports.typeORMConfig = {
    type: "postgres",
    username: "postgres",
    database: "todo",
    password: "root",
    port: 5432,
    logging: true,
    entities: [Todo_1.Todo],
    migrations: [path_1.default.join(__dirname, "./migrations/*")],
    migrationsTableName: "todos",
    cli: {
        migrationsDir: "migration",
    },
};
//# sourceMappingURL=typeorm.config.js.map