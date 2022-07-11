import "reflect-metadata";
import express from "express";

import { __port__ } from "./constants";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { Resolvers } from "./Resolvers";
const main = async () => {
  await createConnection();
  const app: express.Application = express();
  // Routes
  app.get("/", (_req: express.Request, res: express.Response) => {
    return res.status(200).redirect("/graphql");
  });
  // GraphQL server
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [...Resolvers],
      validate: false,
    }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground({})],
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app });
  app.listen(__port__, () => {
    console.log("The server has started at port: %s", __port__);
  });
};

main().catch((err) => console.log(err));
