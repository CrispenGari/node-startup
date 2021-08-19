"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeORMConfig = void 0;
const path_1 = __importDefault(require("path"));
const User_1 = require("./entities/User");
exports.typeORMConfig = {
    type: "postgres",
    username: "postgres",
    database: "users",
    password: "root",
    port: 5432,
    logging: true,
    entities: [User_1.User],
    migrations: [path_1.default.join(__dirname, "./migrations/*")],
    cli: {
        migrationsDir: "migration",
    },
};
//# sourceMappingURL=typeorm.config.js.map