### GraphQL application - Getting lower

In this Notebook we are going to create our first graphql application that will be able to query books. We will hard code the books object and play around to get specific books in that object using the `graphiql` interface in the browser

We have the following `books` array of objects that is in the `./books.js` which looks as follows:

```js
export default [
  { id: 1, name: "Harry Potter and the Chamber of Secrets", authorId: 1 },
  { id: 2, name: "Harry Potter and the Prisoner of Azkaban", authorId: 1 },
  { id: 3, name: "Harry Potter and the Goblet of Fire", authorId: 1 },
  { id: 4, name: "The Fellowship of the Ring", authorId: 2 },
  { id: 5, name: "The Two Towers", authorId: 2 },
  { id: 6, name: "The Return of the King", authorId: 2 },
  { id: 7, name: "The Way of Shadows", authorId: 3 },
  { id: 8, name: "Beyond the Shadows", authorId: 3 },
];
```

- We exported it so that we can import it in our `server.js`. **Note this can be data coming from a database server it doesn't have to be a javascript object.** We will look in depth as we go on how we can use databases and graphql servers.

- By looking at a single book we can come up with the following `BookType` which is of graphql object type.

```js
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
```

- GraphQLNonNull - means our field can not be none.

  > In each field we did not write a resolve function to return a specific value of a field because we already have books. So we come up with 3 different fields which are `name`, `id` and `authorId`.

- Now let's look at how our schema looks and the rest of the code. But first we have a `RootQueryType` which looks as follows:

```js
const RootQueryType = new GraphQLObjectType({
  name: "RootQuery",
  fields: () => ({
    books: {
      type: new GraphQLList(BookType),
      description: "Returns all books available.",
      resolve: () => booksList,
    },
  }),
});
```

- It has a field called `books`. This what we are going to call in `graphiql` to return a list of all books. So right now we have.

1. `GraphQLList` - which tells graphQL that books is expected to return a list of book type/
2. `resolve()` - This method is the one that will return all books that we have imported from `./books.js` as a graphql list.

```js
const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: null,
  description: "GraphQL Schema",
});
```

- We create a schema and pass `RootQueryType` to the key `query` we will look more about the `mutation` later on.

### Using the `graphqlHTTP` midleware

- Basically we are creating connection between express and `graphQL`

```js
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);
```

- `server.js` for now:

```js
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
```

**Query**

```
query{
  books {
   	id
  	authorId
    name
  }
}
```

**Note that we can specify the fields that we want to return.**

**Results**

```json
{
  "data": {
    "books": [
      {
        "id": "1",
        "authorId": 1,
        "name": "Harry Potter and the Chamber of Secrets"
      },
      ....
      {
        "id": "8",
        "authorId": 3,
        "name": "Beyond the Shadows"
      }
    ]
  }
}
```

### Getting a single Book.

We want to add the functionality of getting a book in our `RootQuery` so that we can be able to get the book by it's id. Let's go ahead and implement that.

```js
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
```

We only changed the `RootQuery` by adding a book field under fields which is of type `BookType` and has a property `args`.

1. `args` - a property that grabs the arguments that we are going to use to query a specific book using the `graphiql`.

2. `resolve` - this resolve function takes two arguments which is the `parent` and `args` and applies a higher order javascript array function `find()` to find the book that matches the equality `book.id === args.id`.

**Query**

```
query{
  book(id: 2){
    name
    id
  }
}
```

**Results**

```json
{
  "data": {
    "book": {
      "name": "Harry Potter and the Prisoner of Azkaban",
      "id": "2"
    }
  }
}
```

In the next episode, we are going to look at the following:

- Getting the author of the book
- Getting all Authors
- Getting books Written by a specific author
