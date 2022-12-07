### Express and GraphQL Yoga

In this example we are going to simply show how we can integrated an express server with `graphql-yoga`.

### Installation

With an express application running we need to install the following packages:

```shell
yarn add graphql-yoga graphql
```

### Defining our `schema`

Our schema will be located in the `src/schema/index.ts` file and it will look as follows:

```ts
import { makeExecutableSchema } from "graphql-tools";
export const schema = makeExecutableSchema({
  typeDefs: `
  type Query{
    hello: String!
  }
  type Mutation{
    message(message: String!): String!
  }
  `,
  resolvers: {
    Query: {
      hello: () => "Hello world",
    },
    Mutation: {
      message: (_, args, __) => {
        return args.message;
      },
    },
  },
});
```

Then in our `server.ts` we are going to have the following code in it:

```ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import router from "./routes";
import { createYoga } from "graphql-yoga";

import { schema } from "./schema";
// ----
const app: express.Application = express();
const PORT: any = 3001 || process.env.PORT;

(async () => {
  const yoga = createYoga({
    schema,
    context: ({ request }) => ({
      myToken: request.headers.get("authorization"),
    }),
    graphiql: true,
    landingPage: false,
    cors: false,
  });
  //
  app.use(cors());
  app.use(express.json());
  app.use(router);
  app.use("/graphql", yoga);
  app.listen(PORT, () => {
    console.log(`The server is running on port: ${PORT}`);
  });
})();
```

Now if we open `http://localhost:3001/graphql` and send the following mutation to the server:

```
mutation SendMessage($message: String!){
  message(message: $message)
}
```

With the following variables:

```json
{
  "message": "hi"
}
```

We will se the following response from the graphql-server

```json
{
  "data": {
    "message": "hi"
  }
}
```

We are also be able to send a query to the server to get a hello world message as follows:

```
query HelloWorld{
  hello
}
```

Here is the response from the graphql api.

```json
{
  "data": {
    "hello": "Hello world"
  }
}
```
