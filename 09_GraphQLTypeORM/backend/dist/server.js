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
const cors_1 = __importDefault(require("cors"));
const constants_1 = require("./constants");
const typeorm_1 = require("typeorm");
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const apollo_server_core_1 = require("apollo-server-core");
const HelloWorldResolver_1 = require("./resolvers/hello/HelloWorldResolver");
const Register_1 = require("./resolvers/user/Register");
const connect_redis_1 = __importDefault(require("connect-redis"));
const express_session_1 = __importDefault(require("express-session"));
const ioredis_1 = __importDefault(require("ioredis"));
const Login_1 = require("./resolvers/user/Login");
const User_1 = require("./resolvers/user/User");
const Logout_1 = require("./resolvers/user/Logout");
const DeleteAccount_1 = require("./resolvers/user/DeleteAccount");
const Infomation_1 = require("./resolvers/user/Infomation");
const VerifyEmail_1 = require("./resolvers/user/VerifyEmail");
const RequestResetPassword_1 = require("./resolvers/user/RequestResetPassword");
const ChangePassword_1 = require("./resolvers/user/ChangePassword");
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    yield typeorm_1.createConnection();
    const app = express_1.default();
    const RedisStore = connect_redis_1.default(express_session_1.default);
    const redis = new ioredis_1.default();
    app.use(cors_1.default());
    app.all(/[^/graphql]/, (_req, res) => {
        return res.status(200).redirect("/graphql");
    });
    app.use(cors_1.default({
        credentials: true,
        origin: "http://localhost:3000",
    }));
    app.use(express_session_1.default({
        store: new RedisStore({
            client: redis,
        }),
        name: constants_1.__cookieName__,
        secret: constants_1.__secrete__,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: constants_1.__secure__,
            maxAge: constants_1.__maxAge__,
            sameSite: "lax",
        },
    }));
    const apolloSever = new apollo_server_express_1.ApolloServer({
        schema: yield type_graphql_1.buildSchema({
            resolvers: [
                HelloWorldResolver_1.HelloWorldResolver,
                Register_1.RegisterResolver,
                Login_1.LoginResolver,
                User_1.UserResolver,
                Logout_1.LogoutResolver,
                DeleteAccount_1.DeleteAccountResolver,
                Infomation_1.InformationResolver,
                VerifyEmail_1.VerifyEmailResolver,
                RequestResetPassword_1.RequestResetPasswordResolver,
                ChangePassword_1.ChangePasswordResolver,
            ],
            validate: false,
            authChecker: ({ context }, _roles) => {
                return context.req.session.userId;
            },
        }),
        context: ({ req, res }) => ({
            req,
            res,
            redis,
        }),
        plugins: [apollo_server_core_1.ApolloServerPluginLandingPageGraphQLPlayground({})],
    });
    yield apolloSever.start();
    apolloSever.applyMiddleware({ app });
    app.listen(constants_1.__port__, () => console.log("The server has started at port: %d", constants_1.__port__));
});
main()
    .then(() => { })
    .catch((err) => console.error(err));
//# sourceMappingURL=server.js.map