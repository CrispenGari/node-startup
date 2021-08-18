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
const core_1 = require("@mikro-orm/core");
const mikro_orm_config_1 = __importDefault(require("./mikro-orm.config"));
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const constants_1 = require("./constants");
const hello_1 = require("./resolvers/hello");
const user_1 = require("./resolvers/user");
const ioredis_1 = __importDefault(require("ioredis"));
const express_session_1 = __importDefault(require("express-session"));
const connect_redis_1 = __importDefault(require("connect-redis"));
const cors_1 = __importDefault(require("cors"));
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const orm = yield core_1.MikroORM.init(mikro_orm_config_1.default);
    yield orm.getMigrator().up();
    const app = express_1.default();
    const RedisStore = connect_redis_1.default(express_session_1.default);
    const redisClient = new ioredis_1.default();
    app.use(cors_1.default({
        credentials: true,
        origin: "http://localhost:3000",
    }));
    app.use(express_session_1.default({
        store: new RedisStore({ client: redisClient, disableTouch: true }),
        saveUninitialized: false,
        secret: "secret",
        resave: false,
        name: "user",
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
            httpOnly: true,
            secure: false,
            sameSite: "lax",
        },
    }));
    app.get("/", (_req, res) => {
        return res.status(200).redirect("/graphql");
    });
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: yield type_graphql_1.buildSchema({
            validate: false,
            resolvers: [hello_1.HelloResolver, user_1.UserResolver],
        }),
        context: ({ req, res }) => ({ em: orm.em, req, res, redis: redisClient }),
    });
    yield apolloServer.start();
    apolloServer.applyMiddleware({ app, cors: false });
    app.listen(constants_1.__port__, () => console.log("The server has started at port: %d", constants_1.__port__));
});
main()
    .then(() => { })
    .catch((error) => console.error(error));
//# sourceMappingURL=server.js.map