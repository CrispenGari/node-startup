import "reflect-metadata";
import express, { Response, Request, Application } from "express";
import cors from "cors";
import {
  __maxAge__,
  __cookieName__,
  __port__,
  __secrete__,
  __secure__,
} from "./constants";
import { createConnection } from "typeorm";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { HelloWorldResolver } from "./resolvers/hello/HelloWorldResolver";
import { RegisterResolver } from "./resolvers/user/Register";
import connectRedis from "connect-redis";
import session from "express-session";
import Redis from "ioredis";
import { LoginResolver } from "./resolvers/user/Login";
import { UserResolver } from "./resolvers/user/User";
import { LogoutResolver } from "./resolvers/user/Logout";
import { DeleteAccountResolver } from "./resolvers/user/DeleteAccount";
import { InformationResolver } from "./resolvers/user/Infomation";
import { VerifyEmailResolver } from "./resolvers/user/VerifyEmail";
import { RequestResetPasswordResolver } from "./resolvers/user/RequestResetPassword";
import { ChangePasswordResolver } from "./resolvers/user/ChangePassword";

const main = async () => {
  await createConnection();
  const app: Application = express();
  const RedisStore = connectRedis(session);
  const redis: Redis.Redis = new Redis();
  app.use(cors());
  // We don't care about express route since we are going to use graphql
  app.all(/[^/graphql]/, (_req: Request, res: Response) => {
    return res.status(200).redirect("/graphql");
  });

  app.use(
    cors({
      credentials: true,
      origin: "http://localhost:3000",
    })
  );

  app.use(
    session({
      store: new RedisStore({
        client: redis,
      }),
      name: __cookieName__,
      secret: __secrete__,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: __secure__,
        maxAge: __maxAge__,
        sameSite: "lax",
      },
    })
  );

  const apolloSever = new ApolloServer({
    schema: await buildSchema({
      resolvers: [
        HelloWorldResolver,
        RegisterResolver,
        LoginResolver,
        UserResolver,
        LogoutResolver,
        DeleteAccountResolver,
        InformationResolver,
        VerifyEmailResolver,
        RequestResetPasswordResolver,
        ChangePasswordResolver,
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
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground({})],
  });

  await apolloSever.start();
  apolloSever.applyMiddleware({ app });
  app.listen(__port__, () =>
    console.log("The server has started at port: %d", __port__)
  );
};

main()
  .then(() => {})
  .catch((err) => console.error(err));
