"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const constants_1 = require("./constants");
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const hello_1 = require("./resolvers/hello");
const todo_1 = require("./resolvers/todo");
const typeorm_1 = require("typeorm");
const typeorm_config_1 = require("./typeorm.config");
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const conn = yield typeorm_1.createConnection(typeorm_config_1.typeORMConfig);
    yield conn.runMigrations();
    const app = express_1.default();
    app.get("/", (_req, res) => {
        res.status(200).json({
            name: "backend",
            techs: "GraphQL, Express, Type ORM and PostgreSQL",
        });
    });
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: yield type_graphql_1.buildSchema({
            resolvers: [hello_1.HelloResolver, todo_1.TodoResolver],
            validate: false,
        }),
    });
    yield apolloServer.start();
    apolloServer.applyMiddleware({ app });
    app.listen(constants_1.__port__, () => {
        console.log("The server has started at port: %s", constants_1.__port__);
    });
});
main().catch((err) => console.log(err));
//# sourceMappingURL=server.js.map