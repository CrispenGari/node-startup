import express from "express";
import { graphqlHTTP } from "express-graphql";
import {
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";
import books from "./books.js";
import booksList from "./books.js";
const app = express();

const BookType = new GraphQLObjectType({
  name: "Book",
  description: "A single book.",
  fields: () => ({
    name: {
      type: GraphQLNonNull(GraphQLString),
    },
    id: {
      type: GraphQLNonNull(GraphQLID),
    },
    authorId: {
      type: GraphQLNonNull(GraphQLInt),
    },
  }),
});
const RootQueryType = new GraphQLObjectType({
  name: "RootQuery",
  fields: () => ({
    books: {
      type: new GraphQLList(BookType),
      description: "Returns all books available.",
      resolve: () => booksList,
    },
    book: {
      type: BookType,
      description: "Returns a single book.",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) => books.find((book) => book.id === args.id),
    },
  }),
});

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: null,
  description: "GraphQL Schema",
});
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

app.get("/", (req, res) => {
  res
    .status(200)
    .send(`<a href="http://localhost:3001/graphql">GraphIQL Interface</a>`);
});

app.listen(3001, () => console.log("Express GraphQL server running..."));
