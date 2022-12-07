### koa-graphql

In this repository we are going to learn how to implement graphql api's using the `koa.js` library.

### Getting started

The boiler plate code was initialized using the following command:

```shell
initialiseur init
```

### Installation packages

First we need to install the following packages

```shell
yarn add koa-graphql koa-mount graphql-tools graphql subscriptions-transport-ws

# types
yarn add -D @types/koa-mount
```

Now in the server.ts file we are going to add the following code to get our `hello-world` api.

```ts
import "dotenv/config";
import Koa from "koa";
import { graphqlHTTP } from "koa-graphql";
import { makeExecutableSchema } from "graphql-tools";
import mount from "koa-mount";
// ----
const app = new Koa();
const PORT = process.env.PORT || 3001;

const schema = makeExecutableSchema({
  typeDefs: `
    type Query{
        hello: String!
       
    }
    type Mutation{
        greet(name: String!): String!
    }
    `,
  resolvers: {
    Query: {
      hello: () => "Hello there",
    },
    Mutation: {
      greet: (_root, args, context) => {
        console.log({ args, context });
        return `Hello ${args.name}`;
      },
    },
  },
});
app.use(
  mount(
    "/graphql",
    graphqlHTTP({
      schema: schema,
      graphiql: {
        subscriptionEndpoint: `ws://localhost:${PORT}/subscriptions`,
      },
      context: {
        hello: "context values here",
      },
    })
  )
);

app.listen(PORT, () => console.log("The server is running on port: %s", PORT));
```

The above code is a summary code for getting the `hello-world` message from a simple `Query` and a simple `Mutation`. Now if you go to `http://localhost:3001/graphql` you will be able to see the `graphiql` interface and you will be able to run the following `mutations` and `queries`.

Mutation:

```
mutation{
  greet(name: "world")
}
```

Response:

```json
{
  "data": {
    "greet": "Hello world"
  }
}
```

Query:

```
query{
  hello
}
```

Response:

```json
{
  "data": {
    "hello": "Hello there"
  }
}
```

### Refs

1. [koa-graphql](https://www.npmjs.com/package/koa-graphql)
