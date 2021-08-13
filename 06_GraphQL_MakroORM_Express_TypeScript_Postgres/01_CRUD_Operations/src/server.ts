import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import mikroOrmConfig from "./mikro-orm.config";
import express from "express";
import { __port__ } from "./constants";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { TodoResolver } from "./resolvers/todo";
const main = async () => {
  // Database connection and running latest migrations
  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getMigrator().up();

  const app: express.Application = express();

  // Routes
  app.get("/", (_req: express.Request, res: express.Response) => {
    res.status(200).json({
      name: "backend",
      techs: "GraphQL, Express, MakroORM and PostgreSQL",
    });
  });
  // GraphQL server
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, TodoResolver],
      validate: false,
    }),
    context: () => ({ em: orm.em }),
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app });
  app.listen(__port__, () => {
    console.log("The server has started at port: %s", __port__);
  });
};

main().catch((err) => console.log(err));
