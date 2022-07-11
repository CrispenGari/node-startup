### Hello World

In this README we are going to create our first graphql server that will return "Hello Wold".

### `server.js`

```js
import express from "express";
import { graphqlHTTP } from "express-graphql";
import { GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";

const app = express();
const RootQuery = new GraphQLObjectType({
  name: "HelloWorld",
  fields: {
    message: {
      type: GraphQLString,
      resolve: () => "Hello, World.",
    },
  },
});
const schema = new GraphQLSchema({
  query: RootQuery,
  description: "This is the graphQL schema.",
});
app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);
app.get("/", (req, res) => {
  res
    .status(200)
    .send(`<a href="http://localhost:3001/graphql">GraphIQL Interface</a>`);
});

app.listen(3001, () => console.log("Express GraphQL server running..."));
```

### What is going on here?

1. `GraphQLObjectType`
   Allows us to create a graphQL object type, which accepts a lot of args including:

- name - The name of the object
- fields - Fields of the object of:
  - property in our case (message) and a message is an object of type `GraphQLString` which returns hello world when the resolve function is invoked.

2.  `graphqlHTTP`
    This accept a schema and a `graphiql` interface that allows us to test the query if set to true in the browser at route http://localhost:3001/graphql

3.  `GraphQLSchema`

- Allows us to create a graphQLSchema. We will explain further as we go.

Now if we visit the the route http://localhost:3001/graphql we will be able to see the `graphiql` interface which we can interact with and start making queries as follows:

**Query**

```
query{
  message
}
```

**Response**

```json
{
  "data": {
    "message": "Hello, World."
  }
}
```

That's our hello world application in `graphQL`
