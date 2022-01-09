### Hello World

In this example we are ging to create a simple program that will display `Hello World` in `koa.js`

### Installation

```shell
npm i koa
```

### Scripts

In the `package.json` we are going to add the `start` scripts as:

```json
  "scripts": {
    "start": "nodemon src/index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
```

Makesure that you have `nodemon` installed gloabally or as a `dev` dependency. So when we run `npm start` we will start the `koa` server.

> Go to the `src/index.js` and add the following code to it:

```js
const Koa = require("koa");

const PORT = 3001 || process.env.PORT;
const app = new Koa();

app.use(function* () {
  this.body = "<h1>Hello World</h1>";
});

app.listen(PORT, () => {
  console.log("The server is running on port: %s", PORT);
});
```

> `koa deprecated Support for generators will be removed in v3.` so the above code can be refactored to:

```js
const Koa = require("koa");

const PORT = 3001 || process.env.PORT;
const app = new Koa();

app.use(async (ctx) => {
  ctx.body = "<h1>Hello world</h1>";
});

app.listen(PORT, () => {
  console.log("The server is running on port: %s", PORT);
});
```

> Next we are going to build a REST API using `koa`
