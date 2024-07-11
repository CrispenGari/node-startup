### Neon Postgres and DrizzleORM

In this one we are going to look implement a server that uses Neon and Drizzle ORM to perform some basic CRUD operations.

### Getting started

First we need to setup the server and install the following packages:

```shell
yarn add cors express postgres pg drizzle-orm

#  dev dependencies
yarn add -D @types/cors @types/express @types/node dotenv  ts-node ts-node-dev  typescript drizzle-kit @types/pg node-env-types tsx
```

First we are going to create an account at [console.neon.tech](https://console.neon.tech/) and create a new app. I will call my app `pg` and the database name i will call it `todo`. On the dashboard i will take the environmental variables and put them in a `.env` file as follows.

```shell
NODE_ENV = development
```

In our `.prod.env` and `.dev.env` file we are going to add the following code

```shell
PORT = 3001
# Do not expose your Neon credentials to the browser
PGHOST='ep-restless-salad-a58jxwzd.us-east-2.aws.neon.tech'
PGDATABASE='todo'
PGUSER='todo_owner'
PGPASSWORD='yours'
ENDPOINT_ID='yours'
```

After that we are going to create a `schema` folder in the `src` and create a `todo.ts` file which will define the todo's schema as follows:

```ts
import { serial, text, timestamp, pgTable, boolean } from "drizzle-orm/pg-core";
import { /*InferSelectModel*/ InferInsertModel } from "drizzle-orm";

export const todo = pgTable("todo", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export type Todo = InferInsertModel<typeof todo>;
```

In the `package.json` we are going to have the following scripts.

```json
{
  "scripts": {
    "start": "ts-node-dev --respawn --transpile-only src/index.ts",
    "generate": "drizzle-kit generate",
    "migrate": "drizzle-kit migrate",
    "dev:migrate": "tsx migrate.ts"
  }
}
```

Next we are going to create a `drizzle.config.ts` and add the following configurations

```ts
import { defineConfig } from "drizzle-kit";
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/**.ts", // any file that will be found in this folder will be regarded as a schema
  out: "./drizzle",
});
```

Now we can generate the migrations by running the following command:

```shell
yarn migrate
```

Next we are going to create a `migrate.ts` file in the root folder of our project:

```ts
// migrate.ts
import dotenv from "dotenv";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

if (process.env.NODE_ENV === "production") {
  console.log("Running in production mode.");
  dotenv.config({ path: ".prod.env" });
} else {
  console.log("Running in development mode.");
  dotenv.config({ path: ".dev.env" });
}
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;
const sql = postgres({
  host: PGHOST,
  database: PGDATABASE,
  username: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: "require",
  connection: {
    options: `project=${ENDPOINT_ID}`,
  },
});

const databaseUrl = drizzle(sql);

const main = async () => {
  try {
    await migrate(databaseUrl, { migrationsFolder: "drizzle" });
    console.log("Migration complete");
  } catch (error) {
    console.log(error);
  }
  process.exit(0);
};
main();
```

Next we are going to run the following command to run migrate:

```shell
yarn dev:migrate
```

### Connection to Neon database using drizzle

Next we are going to connect our drizzle orm to neon. For that we are going to create a folder called `db` in the `src` folder and in the `index.ts` file we are going to connect to our Neon postgres as follows:

```ts
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const pool = new Pool({
  password: process.env.PGPASSWORD!,
  database: process.env.PGDATABASE!,
  host: process.env.PGHOST!,
  user: process.env.PGUSER,
  ssl: { rejectUnauthorized: false },
});

export const db = drizzle(pool);
```

In our `src/index.ts` we are going to have the following code in it.

```ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import loadEvTypes from "node-env-types";
import process from "process";
import todoRouter from "./routes/todo.routes";

if (process.env.NODE_ENV === "production") {
  console.log("Running in production mode.");
  dotenv.config({ path: ".prod.env" });
  loadEvTypes(process.cwd(), {
    filename: ".prod.env",
  });
} else {
  console.log("Running in development mode.");
  dotenv.config({ path: ".dev.env" });
  loadEvTypes(process.cwd(), {
    filename: ".dev.env",
  });
}

const { PORT } = process.env;

const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/v1/todo", todoRouter);
app.listen(PORT, () => {
  console.log("The server is running on port: %s", PORT);
});
```

Then in the `src/routes/todo.routes.ts` we are going to have the following code in it:

```ts
import { Router, Response, Request } from "express";
import { todo } from "../schema/todo";
import { db } from "../db";
import { eq } from "drizzle-orm";

const todoRouter = Router({
  caseSensitive: true,
});

const handleQueryError = (err: any, res: Response) => {
  return res
    .status(500)
    .json({ error: "An error occurred while executing the query." });
};

todoRouter.get("/", async (req: Request, res: Response) => {
  try {
    const t = await db.select().from(todo);
    return res.status(200).json({ todo: t });
  } catch (error) {
    return handleQueryError(error, res);
  }
});

todoRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const t = await db
      .select()
      .from(todo)
      .where(eq(todo.id, Number.parseInt(id)));
    return res.status(200).json({ todo: t[0] });
  } catch (error) {
    return handleQueryError(error, res);
  }
});
todoRouter.patch("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const t = await db
      .update(todo)
      .set({ title })
      .where(eq(todo.id, Number.parseInt(id)))
      .returning({ id: todo.id });
    return res.status(200).json({ todo: t[0] });
  } catch (error) {
    return handleQueryError(error, res);
  }
});
todoRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.delete(todo).where(eq(todo.id, Number.parseInt(id)));
    return res.status(200).json({ todo: true });
  } catch (error) {
    return handleQueryError(error, res);
  }
});
todoRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { title } = req.body;
    const t = await db.insert(todo).values({ title }).returning({
      id: todo.id,
    });
    return res.status(200).json({ id: t[0].id });
  } catch (error) {
    return handleQueryError(error, res);
  }
});

export default todoRouter;
```

Now we can make request to the following urls and get response:

1. `POST: http//127.0.0.1/api/v1/todo` - create a todo
2. `POST: http//127.0.0.1/api/v1/todo/:id` - update a todo of id `:id`
3. `DELETE: http//127.0.0.1/api/v1/todo/:id` - delete a todo of id `:id`
4. `GET: http//127.0.0.1/api/v1/todo/:id` - gets a todo of id `:id`
5. `GET: http//127.0.0.1/api/v1/todo/` - gets all todos.

### Refs

1. https://neon.tech/docs/guides/node
2. https://orm.drizzle.team/
