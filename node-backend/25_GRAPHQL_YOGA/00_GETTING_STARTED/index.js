import { createYoga } from "graphql-yoga";
import { createServer } from "http";
import { schema } from "./schema.js";

const yoga = createYoga({
  schema,
  graphiql: true,
  cors: false,
  graphqlEndpoint: "/graphql",
  landingPage: false,
  context() {
    return {
      someNumber: -10,
    };
  },
});

const server = createServer(yoga);

server.listen(3001, () =>
  console.log(`The server is running at: http://localhost:3001/graphql`)
);
