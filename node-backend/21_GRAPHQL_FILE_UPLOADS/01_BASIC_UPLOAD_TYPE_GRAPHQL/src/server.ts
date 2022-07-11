import "reflect-metadata";
import express from "express";
import cors from "cors";
import { buildSchema } from "type-graphql";
import { ApolloServer } from "apollo-server-express";
import { resolvers } from "./resolvers";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { graphqlUploadExpress } from "graphql-upload";
import path from "path";
const PORT: any = 3001 || process.env.PORT;
(async () => {
  const app: express.Application = express();
  app.use(cors());
  app.use(express.json());
  app.use("/images", express.static(path.join(__dirname, "../images")));
  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));

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
