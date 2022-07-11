### Creating a REST API with koa

In this one we are going to create a simple rest api using the `koa` framework in `node.js`.

### Setting up

First we need to install `koa` as follows:

```shell
yarn add koa
```

Next we are going to go to the `package.json` file and add the following `start` script to it:

```shell
{
  "name": "01_REST_API",
  "version": "1.0.0",
  "main": "index.js",
  "author": "CrispenGari",
  "license": "MIT",
  "scripts": {
    "start": "nodemon src/index.js"
  },
  "dependencies": {
    "koa": "^2.13.4"
  }
}
```

> Make sure that you have `nodemon` installed either globally or as a `dev` dependency as.

To build a REST API we need to add two more dependencies `koa-body` and `koa-router` as follows:

```shell
yarn add koa-router koa-body
```

1. **koa-body** - is a body-parser middleware. It supports urlencoded, multi-part and json request bodies. Basically, it helps to create and respond to HTTP POST requests which are available as a form field, or a file upload, etc. It tells the server that the incoming request from the client has a body of data. ExpressJS uses the same approach in handling body requests.

2. **koa-router** - is the routing middleware that provides ExpressJS style routing using HTTP verbs. It has methods that you can directly use in the application Such as `app.get()`, `app.post()`, etc.

> Note that in this simple application we are going to create a rest api from the hard-coded data, you can use the database if you want.

### Creating a `koa` application.

The bare minimum lines of code to create a `koa` application that prints `hello` world is as follows:

```js
const Koa = require("koa");
const app = new Koa();
const PORT = process.env.PORT || 3001;
app.use(async (ctx) => {
  ctx.body = "hello world.";
});
app.listen(PORT, () => console.log("The server is running on port: %s", PORT));
```

To start the server we then run the following command:

```shell
yarn start
```

If we visit `http://localhost:3001/` we will get the `hello world` message displayed.

### The `koa-router`

We are then going to create the `router` folder which will contain all our `routes` for the api. We are going to have the following folder structure in the src folder

```
📁 src
    📁 routes
        📁 books
            - index.js
        📁 authors
            - index.js
    - index.js
```

- **books** - will contains all the books routes
- **authors** - will contain all the authors routes.

> Note that as i said we are not going to get to the database part we need we will hard-code all the data so there will be no relationships between the authors and books since we are doing this to show how we can use multiple routes in a `koa` application with different prefixes.

First we need to change our `src/index.js` and make use of the `koa-body` middleware and the `authors` and `books` middlewares as follows:

```js
const Koa = require("koa");
const koaBody = require("koa-body");
const authors = require("./routes/authors/index.js");
const books = require("./routes/books/index.js");

const app = new Koa();
const PORT = process.env.PORT || 3001;

// middlewares
app.use(koaBody());
app.use(authors.routes());
app.use(books.routes());

app.use(async (ctx) => {
  ctx.body = "hello world.";
});

app.listen(PORT, () => console.log("The server is running on port: %s", PORT));
```

> Before modifications our `authors/index.js` looks as follows:

```js
const Router = require("koa-router");
const router = new Router({
  prefix: "/api/authors",
});

let authors = [
  { id: 1, bookTitle: "Fight Club", author: "Chuck Palahniuk" },
  { id: 2, bookTitle: "Sharp Objects", author: "Gillian Flynn" },
  { id: 3, bookTitle: "Frankenstein", author: "Mary Shelley" },
  { id: 4, bookTitle: "Into The Wild", author: "John Krakauer" },
];

module.exports = router;
```

> And our `books/index.js` looks as follows:

```js
const Router = require("koa-router");
const router = new Router({
  prefix: "/api/books",
});

let books = [
  { id: 101, name: "Fight Club", author: "Chuck Palahniuk" },
  { id: 102, name: "Sharp Objects", author: "Gillian Flynn" },
  { id: 103, name: "Frankenstein", author: "Mary Shelley" },
  { id: 101, name: "Into The Wild", author: "John Krakauer" },
];

module.exports = router;
```

### Getting all the books and Authors

We are going to modify our `books/index.js` to:

```ts
..
router.get("/all", (ctx, next) => {
  ctx.body = authors; // this can be coming from a database
  next();
});
..
```

And we are going to modify our `authors/index.js` to:

```ts
..

router.get("/all", (ctx, next) => {
  ctx.body = authors; // this can be coming from a database
  next();
});

..
```

Now we can be able to get all the books by sending a `GET` request at `http://localhost:3001/api/authors/all` for authors

```json
[
  {
    "id": 1,
    "bookTitle": "Fight Club",
    "author": "Chuck Palahniuk"
  },
  {
    "id": 2,
    "bookTitle": "Sharp Objects",
    "author": "Gillian Flynn"
  },
  {
    "id": 3,
    "bookTitle": "Frankenstein",
    "author": "Mary Shelley"
  },
  {
    "id": 4,
    "bookTitle": "Into The Wild",
    "author": "John Krakauer"
  }
]
```

And `http://localhost:3001/api/books/all` for books:

```json
[
  {
    "id": 101,
    "name": "Fight Club",
    "author": "Chuck Palahniuk"
  },
  {
    "id": 102,
    "name": "Sharp Objects",
    "author": "Gillian Flynn"
  },
  {
    "id": 103,
    "name": "Frankenstein",
    "author": "Mary Shelley"
  },
  {
    "id": 101,
    "name": "Into The Wild",
    "author": "John Krakauer"
  }
]
```

### Getting all books using `cURL`

To get all the books using curl you will send the following request to the server.

```shell
curl -X GET http://localhost:3001/api/books/all
```

### Getting a single book and a single author.

To get a single book or a single author we do it as follows:

```js
...
const Router = require("koa-router");
const router = new Router({
  prefix: "/api/books",
});

let books = [
  { id: 101, name: "Fight Club", author: "Chuck Palahniuk" },
  { id: 102, name: "Sharp Objects", author: "Gillian Flynn" },
  { id: 103, name: "Frankenstein", author: "Mary Shelley" },
  { id: 101, name: "Into The Wild", author: "John Krakauer" },
];

router.get("/all", (ctx, next) => {
  ctx.body = books;
  next();
});

router.get("/one/:id", (ctx, next) => {
  if (ctx.params.id) {
    const book = books.find(
      (book) => book.id === Number.parseInt(ctx.params.id)
    );
    if (!book) {
      ctx.response.status = 404;
      ctx.body = {
        status: 404,
        message: `Could not find the book with id: ${ctx.params.id}`,
      };
      next();
    } else {
      ctx.response.status = 200;
      ctx.body = book;
      next();
    }
  } else {
    ctx.response.status = 500;
    ctx.body = {
      status: 500,
      message: "Internal server error.",
    };
    next();
  }
});
module.exports = router;
...
```

> Since the code will be the same we are going to do for only `books`.

If you hit the server with a `GET` request at `http://localhost:3001/api/books/one/101` you should get the following response:

```json
{
  "id": 101,
  "name": "Fight Club",
  "author": "Chuck Palahniuk"
}
```

### Getting a single book using `cURL`

to get a single book using curl we run the following command:'

```shell
curl -X GET http://localhost:3001/api/books/all/102
```

> where `102` is the id of the book we want to get.

### Creating a book.

To create a book we send a `POST` request to the server with some `request` body. We are going to add the following in the `books/index.js`

```js
{
    "id": 23,
    "name": "My book",
    "author": "My Author"
}
```

Now if you send a post request at `http://localhost:3001/api/books/new`
with the following request body you will get the following response:

```json
{
  "id": 23,
  "name": "My book",
  "author": "My Author"
}
```

### Posting using `cURL`

To create a new book using `cURL` we run the following command

```shell
curl -X POST http://localhost:3001/api/books/new --data "id=200&name=My%20Book&author=My%20Author"
```

### Deleting a book

To delete a book we are going to add the following `delete` method to our `books/index.js` file

```js
...
router.delete("/delete/:id", (ctx, next) => {
  if (ctx.params.id) {
    books = books.filter((book) => book.id !== ctx.params.id);
    ctx.body = true;
    next;
  } else {
    ctx.response.status = 500;
    ctx.body = false;
    next();
  }
});
...
```

### Deleting a book using `cURL`

```shell
curl -X DELETE http://localhost:3001/api/books/delete/102
```

### Refs

1. [koa](https://koajs.com/)
2. [www.crowdbotics.com](https://www.crowdbotics.com/blog/how-to-build-a-rest-api-with-koajs)
