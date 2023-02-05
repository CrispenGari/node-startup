### Basics of Fastify

First we need to install the `fastify` package by running the following command:

```shell
yarn add fastify
```

Let's open our `server.ts` and add the following code in it:

```ts
import Fastify, { FastifyReply, FastifyRequest } from "fastify";

const PORT: any = process.env.PORT || 3001;
const HOST =
  process.env.NODE_ENV === "production"
    ? "0.0.0.0"
    : "localhost" || "127.0.0.1";

const fastify = Fastify({
  logger: true,
  ignoreTrailingSlash: true,
});

fastify.get("/", (request: FastifyRequest, reply: FastifyReply) =>
  reply.send({
    message: "Hello world",
    code: 200,
  })
);

fastify.listen({ port: PORT, host: HOST }, (error, address) => {
  if (error) {
    fastify.log.error(error);
    process.exit(1);
  }
  fastify.log.info(` Server is now listening on ${address}`);
});
```

Now if we open the browser on `http://127.0.0.1:3001/` we will get the following `json` response:

```json
{
  "message": "Hello world",
  "code": 200
}
```

### Plugins

As with JavaScript, where everything is an object, with Fastify everything is a plugin.

Let's define our routes in a separate folder called `routes`. In that folder we are going to create a file called `hello/hello.ts` and add the following code in it:

```ts
import {
  FastifyInstance,
  FastifyServerOptions,
  FastifyReply,
  FastifyRequest,
} from "fastify";

export const helloRoute = async (
  fastify: FastifyInstance,
  options: FastifyServerOptions
) => {
  fastify.setErrorHandler(async (err) => {
    console.log(err.message);
    throw new Error("caught");
  });
  fastify.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send({
      code: 200,
      message: "Hello world",
    });
  });
};
```

Now in the `routes/index.ts` we are going to have the following code

```ts
export { helloRoute } from "./hello/hello";
```

In our `server.ts` file we can register our `helloRoute` as follows:

```ts
...
fastify.register(helloRoute);
...
```

### CRUD Operations

Next we are going to create a `CRUD` operations `API` on `movies`. We are going to install `postgres` driver for nodejs called `pg`.

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

To create a table movies we will run the following command:

```shell
postgres=# \c movies
# Then
movies=# \i movies.sql

```

In the `src/db/index.ts` we are going to add the following to the `Pool`:

```ts
import { Pool } from "pg";
export const pool = new Pool({
  host: "localhost" || "127.0.0.1",
  password: "root",
  user: "postgres",
  port: 5432,
  database: "movies",
});
```

> With this we can be able to use the `pool` object to make queries to the databases. Now it's time to create to our rest api on movies.

First we will need to create a `routes/movies/movies.ts` file and export it in our `routes/index.ts` as follows:

```ts
export { helloRoute } from "./hello/hello";
export { moviesRoute } from "./movies/movies";
```

After that we will need to register it in our `server.ts` as follows:

```ts
...
fastify.register(helloRoute);
fastify.register(moviesRoute, {
  prefix: "/api/movies",
});
...
```

### CRUD Operations

In the `src/routes/movies/movies.ts` we are going to have the following code in it and this code will handle all requests coming up for movies api at `/api/movies/*`

```ts
import {
  FastifyInstance,
  FastifyServerOptions,
  FastifyReply,
  FastifyRequest,
} from "fastify";

import { pool } from "../../db";
export const moviesRoute = async (
  fastify: FastifyInstance,
  options: FastifyServerOptions
) => {
  fastify.setErrorHandler(async (err) => {
    console.log(err.message);
    throw new Error("Error occured in the movies route");
  });

  fastify.get("/all", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const movies = await pool.query("SELECT * FROM movies;");
      return reply.status(200).send({
        code: 200,
        movies: movies.rows,
      });
    } catch (error: any) {
      console.log({ error });
      return reply.status(500).send({ code: 500, message: error.message });
    }
  });

  fastify.get(
    "/one/:uid",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const params: any = request.params;
        const movie = await pool.query(
          "SELECT * FROM movies WHERE uid=$1::integer;",
          [params.uid]
        );
        return reply.status(200).send({
          code: 200,
          movie: movie.rows![0],
        });
      } catch (error: any) {
        return reply.status(500).send({ code: 500, message: error.message });
      }
    }
  );

  fastify.put(
    "/update/:uid",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { params, body } = request;
        const { title, decription } = body as any;
        const data = await pool.query(
          `UPDATE movies SET title = $1, decription = $2 WHERE uid = $3 RETURNING *;`,
          [title, decription, (params as any).uid]
        );
        return reply.status(200).send({
          code: 200,
          movie: data.rows![0],
        });
      } catch (error: any) {
        return reply.status(500).send({ code: 500, message: error.message });
      }
    }
  );

  fastify.post("/new", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { body } = request;
      const { title, decription } = body as any;
      const data = await pool.query(
        "INSERT INTO movies (title, decription) VALUES($1, $2) RETURNING *;",
        [title, decription]
      );
      return reply.status(201).send({
        code: 201,
        movie: data.rows![0],
      });
    } catch (error: any) {
      return reply.status(500).send({ code: 500, message: error.message });
    }
  });
  fastify.delete(
    "/delete/:uid",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { params } = request;
        await pool.query("DELETE FROM movies WHERE uid=$1;", [
          (params as any).uid,
        ]);
        return reply.status(200).send({
          code: 200,
          deleted: true,
        });
      } catch (error: any) {
        return reply.status(500).send({ code: 500, message: error.message });
      }
    }
  );
};
```

> You can test this api by opening the `requests.rest` file that is in the `root` directory of the project folder.

For testing the `API` using `jest` you can refer to [this repository](https://github.com/CrispenGari/node-startup/tree/main/node-backend/22_KOA/02_POSTGRESS_CRUD)
