### Basic CRUD Operations in Express, GraphQL, Mikro ORM and TypeScript.

### Creating a project.

1. Creating a `package.json` file

```
yarn init -y
```

2. Install node types

```
yarn add @types/node
```

3. Creating `scripts`.

```
yarn add ts-node
```

4. Installing typescript.

```
yarn add -D typescript
```

5. Creating a `tsconfig.json`
   The docs can be found [here](https://github.com/CrispenGari/tsconfig.json)

```
npx ts-config-files.json
```

In the package.json file we are going to add the following under scripts:

```json
{
  "start": "ts-node src/server.ts"
}
```

This script will just run the `server.ts` file that is in the `src` folder. **But the problem is that it is slow.** So what can we do to improve this. We will create a new script called `watch`.

```json
{
  "watch": "tsc -w"
}
```

The `watch` will watch any changes in our files and create a new `dist` folder with a `server.js`. So every-time we save a file the dist folder will be recreated. So to execute the file created in the terminal we have to run the following command.

```
node dist/server.js
```

- But this is kind boring because we want to start restart the server as soon as we save the file, for that we can use a package called `nodemon` this will watch all our changes. So we will add a new script called `"dev"`:

```json
{
  "dev": "nodemon dist/server.js"
}
```

**Keep in mind that the watch script should always run in the background even we are using `nodemon`.**

If you want `nodemon` to watch typescript you will add the following command in the package.json. We are not going to use it since it is kinda slow.

```json
{
  "dev": "nodemon --exec ts-node src/server.ts"
}
```

### Setting up Mikro-ORM and PostgreSQL

Note that according to the docs you can use mikro-orm with any database you want.

1. Installation
   Installing:
   a. `@mikro-orm/cli`- Command Line Interface
   b. `@mikro-orm/migtations`
   c. `ps`- Postgres
   d. `@mikro-orm/postgresql`- Postgres
   e. `@mikro-orm/core`- Postgres

```
yarn add @mikro-orm/cli @mikro-orm/migrations @mikro-orm/core @mikro-orm/postgresql pg
```

2. Creating a database.
   Open `psql` and run the following command.

```
CREATE DATABASE todo;
```

3. Creating an Entity
   We are going to create a simple todo applications so all our entities will be in the `src/entities`. Our first entity Todo will look as follows:

```ts
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Todo {
  @PrimaryKey()
  id: number;

  @Property({ type: "date" })
  createdAt = new Date();

  @Property({ type: "date", onUpdate: () => new Date() })
  updatedAt = new Date();

  @Property({ type: "text" })
  title!: string;
  @Property({ type: "boolean", default: false })
  completed!: boolean;
}
```

4. We will then configure our application for migrations. First of all we need to go to the `package.json` and add the following to it:

```json
...
 "mikro-orm": {
    "useTsNode": true,
    "configPaths": [
      "./src/mikro-orm.config.ts",
      "./dist/mikro-orm.config.js"
    ]
  }
```

5. We will then create a `mikro-orm.config.ts` and add the following code to it:

```ts
import { MikroORM } from "@mikro-orm/core";
import { Todo } from "./entities/Todo";
import path from "path";
export default {
  entities: [Todo],
  migrations: {
    path: path.join(__dirname, "./migrations"),
    pattern: /^[\w-]+\d+\.[t|j]s$/,
  },
  dbName: "todo",
  password: "root",
  user: "postgres",
  port: 5432,
  debug: process.env.NODE_ENV !== "production",
  type: "postgresql",
} as Parameters<typeof MikroORM.init>[0];
// as const
```

6. Our `server.ts` will look as follows

```ts
import { MikroORM } from "@mikro-orm/core";
import { Todo } from "./entities/Todo";
import mikroOrmConfig from "./mikro-orm.config";
const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  const todo = orm.em.create(Todo, {
    title: "Cleaning",
  });
  await orm.em.persistAndFlush(todo);
};

main().catch((err) => console.log(err));
```

7. Now to run migration we can either use the `cli` by doing the following:

```
npx mikro-orm migration:create
```

- All the command can be found in the [docs](https://mikro-orm.io/docs/migrations/#using-via-cli)

  We want migrations automatically by changing the `server.ts` to look as follows using the `orm.getMigrator().up()`

```ts
import { MikroORM } from "@mikro-orm/core";
import { Todo } from "./entities/Todo";
import mikroOrmConfig from "./mikro-orm.config";
const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getMigrator().up();
  const todo = orm.em.create(Todo, {
    title: "Cleaning",
  });
  await orm.em.persistAndFlush(todo);
};
main().catch((err) => console.log(err));
```

### References

- [mikro-orm](https://mikro-orm.io/docs/i)
