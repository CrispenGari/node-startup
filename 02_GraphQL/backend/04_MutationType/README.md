### Mutation Type.

We are just taking over from where we left on the from the last `Readme` file. We want to be able to update, delete and insert in our database. Not that we don't have a real database so we will be performing some array manipulation that only works temporarily. We have been working with the `query` type from the previous README's but now we want to be able to send data back to the server. How can we do that. Looking at our `schema` it looks as follows:

```js
const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: null,
  description: "This is the graphQL schema.",
});
```

**`mutation`** - property is null for now we want to create a mutation type which basicaly looks almost the same a the query type. We are going to call it `RootMutationType`. We want to be able to update books, delete books, inserting new books.

The `RootMutationType`:

```js
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
  }),
});
```

**Adding a Book**

The following mutation will add a book to the book list and return the added book

```
mutation{
 addBook(id: 10, authorId:10, name: "Machine Learning" ) {
   name,
   id,
  authorId
 }
}
```

**Response**

```json
{
  "data": {
    "addBook": {
      "name": "Machine Learning",
      "id": 10,
      "authorId": 10
    }
  }
}
```

**Adding an author**

The following will add an author and returns the added author.

```
mutation{
  addAuthor(id: 10, name: "Crispen Gari"){
    name,
    id
  }
}
```

**Response**

```json
{
  "data": {
    "addAuthor": {
      "name": "Crispen Gari",
      "id": 10
    }
  }
}
```

**Getting the added Author**

The following will get the added author of id `10`. **Make sure you don't refresh your browser since this is not stored in the database.**

**Query**

```
query{
  author(id: 10){
   name,
    id,
    books{
      name,
      id
    }
  }
}
```

**Response**

```json
{
  "data": {
    "author": {
      "name": "Crispen Gari",
      "id": 10,
      "books": [
        {
          "name": "Machine Learning",
          "id": 10
        }
      ]
    }
  }
}
```

- The same applies to the **Update** and **Delete** as well. Since we don't have a database let's do the delete mutation.

```js
  deleteBook: {
      type: BookType,
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) => {
        books = books.filter((book) => book.id !== args.id);
      },
    },
```

**The book mutation will look as follows, but normally this will be DELETING the actual book from the database server.**

That the basics about mutations
