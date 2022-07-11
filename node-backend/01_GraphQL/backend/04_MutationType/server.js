import express from "express";
import { graphqlHTTP } from "express-graphql";
import {
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";
import bookList from "./books.js";
import authorsList from "./authors.js";
import books from "./books.js";
import authors from "./authors.js";
const app = express();

const BookType = new GraphQLObjectType({
  name: "Book",
  description: "This is a book type.",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    authorId: { type: GraphQLNonNull(GraphQLInt) },
    author: {
      type: AuthorType,
      resolve: (parent, args) =>
        authors.find((author) => parent.authorId === author.id),
    },
  }),
});

const AuthorType = new GraphQLObjectType({
  name: "Author",
  description: "An Author of a book.",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    books: {
      type: GraphQLList(BookType),
      resolve: (parent, args) =>
        books.filter((book) => book.authorId === parent.id),
    },
  }),
});

const RootQueryType = new GraphQLObjectType({
  name: "RootQuery",
  description: "The root query type.",
  fields: () => ({
    books: {
      description: "Getting all books.",
      type: GraphQLList(BookType),
      resolve: () => bookList,
    },
    book: {
      description: "Getting a book by id",
      type: BookType,
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, args) => books.find((book) => book.id === args.id),
    },
    authors: {
      description: "Getting all authors of the book.",
      type: GraphQLList(AuthorType),
      resolve: () => authorsList,
    },
    author: {
      description: "Getting a specific author of a book.",
      type: AuthorType,
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) => authors.find((author) => args.id == author.id),
    },
  }),
});

const RootMutationType = new GraphQLObjectType({
  name: "RootMutation",
  description: "This is a root mutation type",
  fields: () => ({
    addBook: {
      type: BookType,
      args: {
        authorId: { type: GraphQLInt },
        id: { type: GraphQLInt },
        name: { type: GraphQLString },
      },
      resolve: (parent, args) => {
        const book = {
          id: args.id,
          name: args.name,
          authorId: args.authorId,
        };
        books.push(book);
        return book;
      },
    },
    addAuthor: {
      type: AuthorType,
      args: {
        id: { type: GraphQLInt },
        name: { type: GraphQLString },
      },
      resolve: (parent, args) => {
        const author = {
          id: args.id,
          name: args.name,
        };
        authors.push(author);
        return author;
      },
    },
    deleteBook: {
      type: BookType,
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) => {
        books = books.filter((book) => book.id !== args.id);
      },
    },
  }),
});

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
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
