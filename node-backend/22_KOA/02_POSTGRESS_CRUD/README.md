### REST api koa and Postgres

In this one we are going to create a simple REST API in `koa`. We are going to perform basic CRUD operations and store the data in the database.

### Getting started

To initialize the project we are going to run the following command:

```shell
yarn init -y
```

Since we will be using `typescript` as a programing langauge we need to install the following packages.

```shell
yarn add ts-node-dev typescript

# node types
yarn add -D @types/node
```

Next we are going to create a `tsconfig.json` file in the root directory.

We are then going to navigate to the `package.json` file and edit the `scripts` to:

```json
"scripts": {
    "start": "ts-node-dev --respawn src/server.ts"
  },
```

Now if we run:

```shell
yarn start
```

We will run the file in the `src/server.ts` and it will automatically restart the server on save.

### Setting up the `koa` server.

First we need to install `koa` and to install it we run the following command:

```shell
yarn add koa
# types
yarn add @types/koa
```

We will need two more dependencies `koa-router` and `koa-body` and can be installed by running the following command:

```shell
yarn add koa-router koa-body

# types
yarn add @types/koa-router
```

### Koa server

We are then going to go to the `server.ts` and create a simple `koa` server as follows:

```ts
import Koa from "koa";
import koaBody from "koa-body";
import router from "./routes";

const app = new Koa();
const PORT = process.env.PORT || 3001;

app.use(koaBody());

// routes middleware
app.use(router.routes());

app.listen(PORT, () => console.log("The server is running on port: %s", PORT));
```

The `src/routes/index.ts` looks as follows:

```ts
import KoaRouter from "koa-router";

const router = new KoaRouter({
  prefix: "/api/movies",
});

export default router;
```

### Setting up postgres

First we need to install `pg` dependency and it's typescript types as follows:

```shell
yarn add pg

# types
yarn add -D @types/pg

```

> Having postgres installed in your computer we will be able to run postgres commands. Open command prompt and run the following command:

```shell
psql -U postgres
# type your password and hit enter.
```

1. Creating a database

To create a database we are going to run the following command in the postgres shell:

```shell
postgres=# create database movies;
```

2. Creating a table `movies`

We are going to create a `movies.sql` file and it will be looking as follows:

```sql
-- Creating a Table movies

CREATE TABLE IF NOT EXISTS movies(
    uid SERIAL NOT NULL,
    title TEXT NOT NULL UNIQUE,
    decription TEXT NOT NULL,
    PRIMARY KEY(uid)
);
```

To create a table `movies` we will run the following command:

```shell
movies=# \i movies.sql


# make sure you have selected the database movies
```

In the `src/db/index.ts` we are going to add the following to the `Pool`:

```ts
import { Pool } from "pg";
const pool = new Pool({
  host: "localhost" || "127.0.0.1",
  password: "root",
  user: "postgres",
  port: 5432,
  database: "movies",
});
export default pool;
```

> With this we can be able to use the `pool` object to make queries to the databases. Now it's time to create to our rest api on movies.

1. Creating a movie.

- To create a movie we hit the server (POST) at `http://localhost:3001/api/movies/new` and the code for doing so is at:

```ts
router.post("/new", async (ctx, next) => {
  try {
    const { title, decription } = ctx.request.body;
    const data = await pool.query(
      "INSERT INTO movies (title, decription) VALUES($1, $2) RETURNING *;",
      [title, decription]
    );
    ctx.response.status = 201;
    ctx.body = data.rows;
    next();
  } catch (error) {
    ctx.response.status = 500;
    ctx.body = {
      status: 500,
      message: error?.message,
    };
    next();
  }
});
```

> Note that we need to send the above request with a body which looks as follows:

```json
{
  "decription": "this is a simple movie.",
  "title": "title 1"
}
```

2. Getting all the movie

- To get all the movies we hit the server (GET) at `http://localhost:3001/api/movies/all` and the code for doing this on the server is as follows:

```ts
router.get("/all", async (ctx, next) => {
  try {
    ctx.response.status = 200;
    const movies = await pool.query("SELECT * FROM movies;");
    ctx.body = movies.rows;
    next();
  } catch (error) {
    ctx.response.status = 500;
    ctx.body = {
      status: 500,
      message: error?.message,
    };
    next();
  }
});
```

3. Getting a single movie
   - To get a single movie by `uid` we hit the server (GET) at `http://localhost:3001/api/movies/one/1` where `1` in the url is the uid of the movie we want to delete the code for doing so on the server is as follows:

```ts
router.get("/one/:uid", async (ctx, next) => {
  try {
    const { uid } = ctx.params;
    ctx.response.status = 200;
    const movie = await pool.query(
      "SELECT * FROM movies WHERE uid=$1::integer;",
      [uid]
    );
    ctx.body = movie.rows![0];
    next();
  } catch (error) {
    ctx.response.status = 500;
    ctx.body = {
      status: 500,
      message: error?.message,
    };
    next();
  }
});
```

4. Updating a movie

- To update a movie we hit the server (PUT) at `http://localhost:3001/api/movies/update/1` with the request body which looks as follows:

> Note that `1` is the id of the movie to be updated

```json
{
  "decription": "new description",
  "title": "new title"
}
```

The server code for making updates on the `movie` is as follows:

```ts
router.put("/update/:uid", async (ctx, next) => {
  try {
    const { uid } = ctx.params;
    const { title, decription } = ctx.request.body;

    const data = await pool.query(
      `UPDATE movies SET title = $1, decription = $2 WHERE uid = $3 RETURNING *;`,
      [title, decription, uid]
    );
    ctx.body = data.rows![0];
    next();
  } catch (error) {
    ctx.response.status = 500;
    ctx.body = {
      status: 500,
      message: error?.message,
    };
    next();
  }
```

5. Deleting a movie

- To delete s move we send the DELETE request at DELETE `http://localhost:3001/api/movies/delete/1` where 1 is the id of the movie to be deleted. The code for doing so is as follows:

```ts
router.delete("/delete/:uid", async (ctx, next) => {
  try {
    const { uid } = ctx.params;
    ctx.response.status = 200;
    await pool.query("DELETE FROM movies WHERE uid=$1;", [uid]);
    ctx.body = true;
    next();
  } catch (error) {
    ctx.response.status = 500;
    ctx.body = {
      status: 500,
      message: error?.message,
    };
    next();
  }
});
```

### Testing the API using jest.

To test a rest API we need the following dependencies when working with typescript.

1. jest
2. @types/jest
3. ts-jest

- This is the TypeScript preprocessor for jest (ts-jest) which allows jest to transpile TypeScript on the fly and have source-map support built-in.

5. supertest

- SuperTest is an HTTP assertions library that allows you to test your Node.js HTTP servers. It is built on top of the SuperAgent library, which is an HTTP client for Node.js.

### Installation of required packages for testing a REST API in node.ts

To install all the required packages for `node.js` rest api testing we run the following command:

```shell
yarn add jest ts-jest supertest
# jest and supertest types
yarn add -D @types/jest  @types/supertest
```

Then we will go to the `root` folder of the project and add the `jest.config.js` and will look as follows:

```ts
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFiles: ["dotenv/config"],
};
```

> `setupFiles` will allow us to access `.env` variables in the test cases file. Make sure that you install the `dotenv` package by running:

```shell
yarn add dotenv
```

Now we will go to the `package.json` file and add the `test` scripts:

```json
  "scripts": {
    "start": "ts-node-dev --respawn src/server.ts",
    "test": "jest --forceExit",
    "test:watch": "jest --watch"
  },
```

### Testing

All the testing code will be in the `test/index.test.ts` file and looks as follows:

```ts
import { client } from "../src/db";
import request from "supertest";

import { app } from "../src/server";

beforeAll(async () => {
  await client.query(
    "CREATE TABLE IF NOT EXISTS movies (uid SERIAL NOT NULL, title TEXT NOT NULL UNIQUE, decription TEXT NOT NULL, PRIMARY KEY(uid))"
  );
});

beforeEach(async () => {
  // seed with some data
  await client.query(
    "INSERT INTO movies (title, decription) VALUES ('Title 1', 'Description 1'), ('Title 2', 'Description 2')"
  );
});

afterEach(async () => {
  await client.query("DELETE FROM movies");
});

// --------------- Test cases

describe("GET / with 404 status ", () => {
  test("This test if for world card routes of the API.", async () => {
    const response = await request(app.callback()).get("/");
    expect(response.statusCode).toBe(404);
  });
});

describe("POST /api/movies/new ", () => {
  test("This test creating a movie.", async () => {
    const response = await request(app.callback())
      .post("/api/movies/new")
      .send({
        title: "testing title " + Math.random().toString().slice(2),
        decription: "description",
      });
    expect(response.body).toHaveProperty("uid");
    expect(response.body).toHaveProperty("title");
    expect(response.body).toHaveProperty("decription");
    expect(response.statusCode).toBe(201);
  });
});

describe("DELETE /api/movies/delete/:uid ", () => {
  test("This test deleting a movie.", async () => {
    // Create a new movie
    const response = await request(app.callback())
      .post("/api/movies/new")
      .send({
        title: "testing title " + Math.random().toString().slice(2),
        decription: "description",
      });

    expect(response.body).toHaveProperty("uid");
    expect(response.body).toHaveProperty("title");
    expect(response.body).toHaveProperty("decription");
    // Delete the created movie
    const res = await request(app.callback()).delete(
      "/api/movies/delete/" + response.body.uid
    );
    expect(res.body).toBeTruthy();
    expect(res.statusCode).toBe(200);
  });
});

describe("GET /api/movies/all ", () => {
  test("This test is for getting all the movies from the API.", async () => {
    const response = await request(app.callback()).get("/api/movies/all");
    expect(response.statusCode).toBe(200);
  });
});

describe("GET /api/movies/one/:uid ", () => {
  test("Getting a single movie from an API.", async () => {
    //    Creating a movie
    const response = await request(app.callback())
      .post("/api/movies/new")
      .send({
        title: "testing title " + Math.random().toString().slice(2),
        decription: "description",
      });
    expect(response.body).toHaveProperty("uid");
    expect(response.body).toHaveProperty("title");
    expect(response.body).toHaveProperty("decription");
    // Getting the created movie
    const res = await request(app.callback()).get(
      "/api/movies/one/" + response.body.uid
    );
    expect(res.body).toBeTruthy();
    expect(res.body).toHaveProperty("uid");
    expect(res.body).toHaveProperty("title");
    expect(res.body).toHaveProperty("decription");
    expect(res.statusCode).toBe(200);
  });
});

describe("PUT /api/movies/update/:uid ", () => {
  test("Updating a single movie from an API.", async () => {
    //    Creating a movie
    const response = await request(app.callback())
      .post("/api/movies/new")
      .send({
        title: "testing title " + Math.random().toString().slice(2),
        decription: "description",
      });
    expect(response.body).toHaveProperty("uid");
    expect(response.body).toHaveProperty("title");
    expect(response.body).toHaveProperty("decription");

    // Update the created movie
    const res = await request(app.callback())
      .put("/api/movies/update/" + response.body.uid)
      .send({
        title: "testing updated " + Math.random().toString().slice(2),
        decription: "description updated",
      });

    expect(res.body).toBeTruthy();
    expect(res.body.decription).toContain("updated");
    expect(res.body).toHaveProperty("uid");
    expect(res.body).toHaveProperty("title");
    expect(res.body).toHaveProperty("decription");
    expect(res.statusCode).toBe(200);
  });
});

afterAll(async () => {
  await client.query("DROP TABLE movies");
  await client.end();
});
```

> All the test should run and pass.

### Refs

1. [rithmschool](https://github.com/rithmschool/express-pg-jest-supertest)
2. [medium.com](https://medium.com/hackernoon/async-testing-koa-with-jest-1b6e84521b71)
3. [javascript.plainenglish.io](https://javascript.plainenglish.io/beginners-guide-to-testing-jest-with-node-typescript-1f46a1b87dad)
