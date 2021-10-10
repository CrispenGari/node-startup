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
