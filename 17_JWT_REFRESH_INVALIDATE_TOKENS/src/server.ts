import "dotenv/config";
import "reflect-metadata";
import express, { Application } from "express";
import cors from "cors";
import { __port__ } from "./constants";
import { createConnection } from "typeorm";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { resolvers } from "./resolvers";
import cookieParser from "cookie-parser";
import router from "./routes";
import { authenticationMiddlewareFn } from "./middlewares";

(async () => {
  await createConnection();
  const app: Application = express();
  app.use(cookieParser());
  app.use(cors());
  app.use(authenticationMiddlewareFn);
  app.use(router);
  const apolloSever = new ApolloServer({
    schema: await buildSchema({
      resolvers: resolvers,
      validate: false,
    }),
    context: ({ req, res }) => ({
      req,
      res,
    }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground({})],
  });

  await apolloSever.start();
  apolloSever.applyMiddleware({ app });
  app.listen(__port__);
})()
  .then(() => console.log("The server has started at port: %d", __port__))
  .catch((err) => console.error(err));
