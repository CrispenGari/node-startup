import "reflect-metadata";
import express from "express";
import { __port__ } from "./constants";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { TodoResolver } from "./resolvers/todo";
import { createConnection } from "typeorm";
import { typeORMConfig } from "./typeorm.config";
const main = async () => {
  const conn = await createConnection(typeORMConfig);
  await conn.runMigrations();
  // await Todo.delete({});

  const app: express.Application = express();
  // Routes
  app.get("/", (_req: express.Request, res: express.Response) => {
    res.status(200).json({
      name: "backend",
      techs: "GraphQL, Express, Type ORM and PostgreSQL",
    });
  });
  // GraphQL server
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, TodoResolver],
      validate: false,
    }),
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app });
  app.listen(__port__, () => {
    console.log("The server has started at port: %s", __port__);
  });
};

main().catch((err) => console.log(err));
