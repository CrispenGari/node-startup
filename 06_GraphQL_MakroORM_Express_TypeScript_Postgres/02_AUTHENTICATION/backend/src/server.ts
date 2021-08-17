import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import mikroOrmConfig from "./mikro-orm.config";
import express, { Application, Response, Request } from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { __port__ } from "./constants";
import { HelloResolver } from "./resolvers/hello";
import { UserResolver } from "./resolvers/user";

import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import cors from "cors";
const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getMigrator().up();

  const app: Application = express();

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  app.use(
    cors({
      credentials: true,
      origin: "http://localhost:3000",
    })
  );
  app.use(
    session({
      store: new RedisStore({ client: redisClient, disableTouch: true }),
      saveUninitialized: false,
      secret: "secret",
      resave: false,
      name: "user",
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        secure: false, // https when true
        sameSite: "lax",
      },
    })
  );

  /*
  Since it is a graphql server we are don't care
  about other routes.
  */
  app.get("/", (_req: Request, res: Response) => {
    return res.status(200).redirect("/graphql");
  });
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      validate: false,
      resolvers: [HelloResolver, UserResolver],
    }),
    context: ({ req, res }) => ({ em: orm.em, req, res }),
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, cors:false });
  app.listen(__port__, () =>
    console.log("The server has started at port: %d", __port__)
  );
};

main()
  .then(() => {})
  .catch((error) => console.error(error));
