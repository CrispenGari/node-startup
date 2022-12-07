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
