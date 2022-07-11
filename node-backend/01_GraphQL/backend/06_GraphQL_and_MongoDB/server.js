import express from "express";
import { graphqlHTTP } from "express-graphql";
import cors from "cors";
import mongoose from "mongoose";
import {
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";

import connection_url from "./connection/index.js";
import { book as Book, author as Author } from "./models/index.js";

const app = express();

mongoose.connect(
  connection_url,
  {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (error) => {
    if (error) {
      throw error;
    }
    console.log("Connected to MongoDB cloud database.");
  }
);

mongoose.connection.once("open", () =>
  console.log("Connection open in MongBB")
);

const BookType = new GraphQLObjectType({
  name: "Book",
  description: "A single book.",
  fields: () => ({
    name: { type: GraphQLNonNull(GraphQLString) },
    id: { type: GraphQLNonNull(GraphQLID) },
    authorId: { type: GraphQLNonNull(GraphQLID) },
    author: {
      type: AuthorType,
      resolve: async (parent, args) => {
        return await Author.findById(parent.authorId);
      },
    },
  }),
});

const AuthorType = new GraphQLObjectType({
  name: "Author",
  description: "A single Author",
  fields: () => ({
    name: { type: GraphQLNonNull(GraphQLString) },
    id: { type: GraphQLNonNull(GraphQLID) },
    books: {
      type: GraphQLList(BookType),
      resolve: async (parent, args) => {
        return await Book.find({ authorId: parent.id });
      },
    },
  }),
});

const RootQueryType = new GraphQLObjectType({
  name: "RootQuery",
  description: "Root Query Type.",
  fields: () => ({
    book: {
      name: "Book",
      description: "A single book",
      type: BookType,
      args: {
        id: { type: GraphQLNonNull(GraphQLID) },
      },
      resolve: async (parent, args) => {
        return await Book.findById(args.id);
      },
    },
    author: {
      name: "Author",
      description: "A single author",
      type: AuthorType,
      args: {
        id: { type: GraphQLNonNull(GraphQLID) },
      },
      resolve: async (parent, args) => {
        return await Author.findById(args.id);
      },
    },
    books: {
      name: "Books",
      description: "Getting all books.",
      type: GraphQLList(BookType),
      resolve: async (parent, args) => {
        return await Book.find({});
      },
    },
    authors: {
      name: "Authors",
      description: "Getting all authors.",
      type: GraphQLList(AuthorType),
      resolve: async (parent, args) => {
        return await Author.find({});
      },
    },
  }),
});

const RootMutationType = new GraphQLObjectType({
  name: "RootMutation",
  description: "Root Mutation Type.",
  fields: () => ({
    addBook: {
      type: BookType,
      args: {
        authorId: { type: GraphQLID },
        name: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        const book = new Book({
          name: args.name,
          authorId: args.authorId,
        });
        return await book.save();
      },
    },
    deleteBook: {
      type: GraphQLList(BookType),
      args: {
        id: { type: GraphQLID },
      },
      resolve: async (parent, args) => {
        await Book.findByIdAndDelete(args.id);
        return Book.find({});
      },
    },
    updateBook: {
      type: BookType,
      args: {
        id: { type: GraphQLID },
        name: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        await Book.findByIdAndUpdate(
          { _id: args.id },
          {
            name: args.name,
          }
        );
        return Book.findById(args.id);
      },
    },
    addAuthor: {
      type: AuthorType,
      args: {
        name: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        const author = new Author({
          name: args.name,
        });
        return await author.save();
      },
    },
    updateAuthor: {
      type: AuthorType,
      args: {
        id: { type: GraphQLID },
        name: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        await Author.updateOne(
          { _id: args.id },
          {
            name: args.name,
          }
        );
        return Author.findById(args.id);
      },
    },
    deleteAuthor: {
      type: GraphQLList(AuthorType),
      args: {
        id: { type: GraphQLID },
      },
      resolve: async (parent, args) => {
        await Author.findByIdAndDelete(args.id);
        return Author.find({});
      },
    },
  }),
});

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
  description: "This is the graphQL schema.",
});

// Midlewares
app.use(cors());
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
