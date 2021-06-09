### GraphQL and MongoDB.

Up to this point we have been working with graphql and our dummy books and authors database. In this one we are going to connect graphQL to mongodb and be able to make queries and mutations. We are going to modify a little our code especially in the `resolve` function and make sure we are now getting data from the database.

- Go ahead and create a [MongoDB](https://accounts.google.com/o/oauth2/auth?state=QWQwT1A4clNCWFdJTys1bFVkelpib01JMUkyM3JqZmI1SldqWW5zVUFUcXdmckdkdTNSNXpxWVFaVVJCQk1Vbw&client_id=971390087100-nq1pekkjvhenn2898dr3b7fm7dcl1cjc.apps.googleusercontent.com&redirect_uri=https%3A%2F%2Fauth.mongodb.com%2Foauth2%2Fv1%2Fauthorize%2Fcallback&response_type=code&display=page&scope=email+openid+profile) application and get a connection url and a password.
- Install the following additional packages which we will work with in creating our MongoDB Server.

```shell
npm install dotenv mongoose cors
```

- MongoDB password will be stored in the `.env` file which looks as follows:

```
PASSWORD = YOUR_MONGODB_PASSWORD
```

**`connection/index.js`**
This file contains our connection url and it looks a follows:

```js
import dotenv from "dotenv";
dotenv.config();
const dbName = "BooksAuthors";
const connection_url = `mongodb+srv://crispen:${process.env.PASSWORD}@cluster0.jka1q.mongodb.net/${dbName}?retryWrites=true&w=majority`;
export default connection_url;
```

**`models/index.js`**
This function contains our Author and Book models and it looks as follows:

```js
import mongoose from "mongoose";

const Book = new mongoose.Schema({
  name: { type: String, required: true },
  authorId: { type: String, required: true },
});

const Author = new mongoose.Schema({
  name: { type: String, required: true },
});

const author = mongoose.model("authors", Author);
const book = mongoose.model("books", Book);

export default {
  author,
  book,
};
```

Nothing complicated for now. Let's jump into our `server.js` and make a connection to our mongodb and also make `RootQueryType`, `RootMutationType`, `BookType` and `AuthorType` graphQL object type just like before.

**server.js**

```js
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
      type: BookType,
      args: {
        id: { type: GraphQLID },
      },
      resolve: async (parent, args) => {},
    },
    updateBook: {
      type: BookType,
      args: {
        id: { type: GraphQLID },
        authorId: { type: GraphQLID },
        name: { type: GraphQLString },
      },
      resolve: async (parent, args) => {},
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
      resolve: (parent, args) => {},
    },
    deleteAuthor: {
      type: AuthorType,
      args: {
        id: { type: GraphQLID },
      },
      resolve: (parent, args) => {},
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
```

- **I added all the Books and Authors from the file to the database.**

* Up to now we are able to make add Books and Authors to the database using `graphiql`
* We are also able to make queries just like from the previous episode.
* Now we want to make an `updateBook`, `deleteBook`, `updateAuthor` and `deleteAuthor` mutation.

**Mutation** - mutation just means changing data.

- The `RootMutationType` in `server.js` file will look as follows:

```js
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
```

Examples:

```
mutation{
	deleteBook(id: "60c1176516c4dc05d088ba12") {
    name
  }
}
```

- Delete the book of a given id and return a list of books left in the database.

```
mutation{
	updateBook(id: "60c1176516c4dc05d088ba12") {
    name
  }
}
```

- Update the book of a given id and return a list of books in the database.

* That's all about this one next we are going to move to the frontend REACT APPLICATION and be able to make queries using a react app.
