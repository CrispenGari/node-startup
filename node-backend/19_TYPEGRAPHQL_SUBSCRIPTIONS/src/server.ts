import "reflect-metadata";
import express, { Application } from "express";
import { createServer } from "http";
import { execute, subscribe } from "graphql";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { createConnection } from "typeorm";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { PostsResolver } from "./resolvers/Posts";
import { PubSub } from "graphql-subscriptions";

(async () => {
  await createConnection();
  const app: Application = express();
  const httpServer = createServer(app);

  const pubsub = new PubSub();

  const schema = await buildSchema({
    resolvers: [PostsResolver],
    validate: false,
  });
  const subscriptionServer = SubscriptionServer.create(
    { schema, execute, subscribe },
    { server: httpServer, path: "/" }
  );
  const apolloSever = new ApolloServer({
    schema,
    context: ({ req, res }) => ({
      req,
      res,
      pubsub,
    }),
    plugins: [
      ApolloServerPluginLandingPageGraphQLPlayground({}),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              subscriptionServer.close();
            },
          };
        },
      },
    ],
  });
  await apolloSever.start();
  apolloSever.applyMiddleware({ app, path: "/" });
  httpServer.listen(3001, () =>
    console.log("The server has started at port: %d", 3001)
  );
})()
  .then(() => {})
  .catch((err) => console.error(err));
