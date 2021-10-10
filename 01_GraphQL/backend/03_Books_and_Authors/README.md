### Books and Authors.

In this README file we are going to discuss and write a lot of code, trying to link authors and their respective books in graphql. We have two separate files that acts as our databases which are `books.js` and `authors.js` which looks exactly as follows. We are going to continue from where we left from the previous Readme file.

### `books.js`

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

### `authors.js`

```js
export default [
  { id: 1, name: "J. K. Rowling" },
  { id: 2, name: "J. R. R. Tolkien" },
  { id: 3, name: "Brent Weeks" },
];
```

Let's make an `AuthorType` so that we will be able to query authors and get all of them as well as getting a specific author. We will change our `RootQueryType` to:

**Author Type**

The author type looks as follows:

```js
const AuthorType = new GraphQLObjectType({
  name: "Author",
  description: "An Author of a book.",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
  }),
});
```

**Book Type**

The book type looks as follows:

```js
const BookType = new GraphQLObjectType({
  name: "Book",
  description: "This is a book type.",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    authorId: { type: GraphQLNonNull(GraphQLInt) },
  }),
});
```

The root query type looks as follows:

```js
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
```

- Now we are able to query all authors as well as a specific author based on `id` as follows:

**Query**

```
{
  authors {
    name
    id
  }
  author(id: 2) {
    id
    name
  }
}

```

**Response**

```json
{
  "data": {
    "authors": [
      {
        "name": "J. K. Rowling",
        "id": 1
      },
        ...
      {
        "name": "Brent Weeks",
        "id": 3
      }
    ],
    "author": {
      "id": 2,
      "name": "J. R. R. Tolkien"
    }
  }
}
```

That's how powerful is graphQL. Now we also want to get the author of a book if we query a book and specifies a `author` key in the `query`. The `RootQueryType` will remain the same we are going to change the following:

**BookType**:

The book type will change to:

```js
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
```

### What is going on here?

We added an author to the book fields so that we can be able to query authors of a book. Author is of author type and we resolve this field by returning the author which has the same `id` as the `authId` in of that book. The `parent` is refering to the current book. That's why we are saying `parent.authorId === author.id`. So if we make the following Query

```
{
 books{
  name
  author{
    name
  }
}
  book(id: 5){
    name,
    author{
      name
    }
  }
}
```

We get

```json
{
  "data": {
    "books": [
      {
        "name": "Harry Potter and the Chamber of Secrets",
        "author": {
          "name": "J. K. Rowling"
        }
      },
      ....
      {
        "name": "Beyond the Shadows",
        "author": {
          "name": "Brent Weeks"
        }
      }
    ],
    "book": {
      "name": "The Two Towers",
      "author": {
        "name": "J. R. R. Tolkien"
      }
    }
  }
}
```

Now let's do the same with the Authors Type. So the difference comes because a single author can have more than one book. Which means when we are querying authors' books we expect a list of book for a specific author. The `AuthorType` will look as follows:

```js
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
```

**Query**

```
{
author(id: 1){
  name
  books{
    name
  }
}
}
```

**Response**

```json
{
  "data": {
    "author": {
      "name": "J. K. Rowling",
      "books": [
        {
          "name": "Harry Potter and the Chamber of Secrets"
        },
        {
          "name": "Harry Potter and the Prisoner of Azkaban"
        },
        {
          "name": "Harry Potter and the Goblet of Fire"
        }
      ]
    }
  }
}
```

That's all about the Authors and books in the next one we are going to look at:

- Mutation type.
