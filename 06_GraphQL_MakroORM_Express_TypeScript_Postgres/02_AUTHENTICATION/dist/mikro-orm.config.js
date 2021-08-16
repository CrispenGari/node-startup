"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const User_1 = require("./entities/User");
exports.default = {
    entities: [User_1.User],
    migrations: {
        path: path_1.default.join(__dirname, "./migrations"),
        pattern: /^[\w-]+\d+\.[t|j]s$/,
        tableName: "users",
    },
    dbName: "users",
    password: "root",
    user: "postgres",
    port: 5432,
    debug: process.env.NODE_ENV !== "production",
    type: "postgresql",
};
//# sourceMappingURL=mikro-orm.config.js.map