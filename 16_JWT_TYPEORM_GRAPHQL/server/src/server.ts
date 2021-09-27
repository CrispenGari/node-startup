import "dotenv/config";
import "reflect-metadata";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import router from "./routes";
import { PORT } from "./utils";
import { createConnection } from "typeorm";
import { buildSchema } from "type-graphql";
import { ApolloServer } from "apollo-server-express";
import { resolvers } from "./resolvers";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";

(async () => {
  await createConnection();
  const app: express.Application = express();
  app.use(
    cors({
      credentials: true,
      origin: "http://localhost:3000/",
    })
  );
  app.use(express.json());
  app.use(cookieParser());
  app.use(router);
  app.listen(PORT);
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: resolvers,
    }),
    context: ({ req, res }) => ({
      req,
      res,
    }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground({})],
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, cors: false });
})()
  .then(() => {
    console.log(`The server is running on port: ${PORT}`);
  })
  .catch((err) => console.error(err));
