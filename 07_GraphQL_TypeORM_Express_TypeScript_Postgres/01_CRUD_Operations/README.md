### Basic CRUD Operations in Express, GraphQL, Type ORM and TypeScript.

We are not going to make more damage to the code since `TypeORM` and `Mikro ORM` are similar. We are going to modify the code a little bit all the code in the file will be in this README file as well.

### Setting up Type-ORM and PostgreSQL

Note that according to the docs you can use mikro-orm with any database you want.

### Global `typeorm` installation

We need to install the `typeorm` global, so that we can be able to use the cli.

```shell
npm i -g typeorm
# Also need to install
npm install -g ts-node # https://github.com/typeorm/typeorm/blob/master/docs/using-cli.md#installing-cli
```

### To create migrations you need to run the following command

```
typeorm migration:create -n
```

1. Installation
   Their [documentation](https://typeorm.io/#/) is clear about the installation process all we need to do is to install `typeorm` and the database we are using which is postgres.

```
yarn add typeorm  pg
```

The good thing is that `typeorm` by default comes with typescript types by default

2. Creating a database.
   Open `psql` and run the following command.

```
CREATE DATABASE todo;
```

3. Creating a table

- We are going to execute this code manually on `psql` command line.

```sql
CREATE TABLE todo(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    updatedAt DATE NOT NULL DEFAULT NOW(),
    createdAt DATE NOT NULL DEFAULT NOW()
)
```

3. Creating an Entity
   We are going to create a simple todo applications so all our entities will be in the `src/entities`. Our first entity Todo will look as follows:

```ts
import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@ObjectType()
@Entity()
export class Todo extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @CreateDateColumn()
  createdat: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedat: Date;

  @Field(() => String)
  @Column({ nullable: false })
  title: string;

  @Field(() => Boolean)
  @Column({ type: Boolean, nullable: false, default: false })
  completed!: boolean;
}
```

4. Our `server.ts` will look as follows

```ts
import "reflect-metadata";
import express from "express";
import { __port__ } from "./constants";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { TodoResolver } from "./resolvers/todo";
import { createConnection } from "typeorm";
import { typeORMConfig } from "./typeorm.config";
const main = async () => {
  const conn = await createConnection(typeORMConfig);
  await conn.runMigrations();
  // await Todo.delete({});

  const app: express.Application = express();
  // Routes
  app.get("/", (_req: express.Request, res: express.Response) => {
    res.status(200).json({
      name: "backend",
      techs: "GraphQL, Express, Type ORM and PostgreSQL",
    });
  });
  // GraphQL server
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, TodoResolver],
      validate: false,
    }),
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app });
  app.listen(__port__, () => {
    console.log("The server has started at port: %s", __port__);
  });
};

main().catch((err) => console.log(err));
```

The file that contains our `createConnection()` config for `typeorm` is located is called `typeorm.config.ts` and has the following configurations:

```ts
import path from "path";
import { createConnection } from "typeorm";
import { Todo } from "./entities/Todo";
export const typeORMConfig = {
  type: "postgres",
  username: "postgres",
  database: "todo",
  password: "root",
  port: 5432,
  logging: true,
  entities: [Todo],
  migrations: [path.join(__dirname, "./migrations/*")],
  migrationsTableName: "todos",
  cli: {
    migrationsDir: "migration",
  },
} as Parameters<typeof createConnection>[0];
```

> So that's basically all we need to setup the a basic `CRUD` application using `typeorm`, `express`, `graphql`, `typescript` and `postgresSQL`. You can visit http://localhost:3001/graphql and start making queries and mutations on the GraphQL playground. The following are mutations and queries you can make:

```r
# getting all todos
{
  todos {
    completed,
    updatedat
    title
    id
    createdat
  }
}
# Creating a todo
mutation{
  addTodo(title: "coding") {
    createdat
    updatedat
    title
    completed
    id
  }
}
# Getting a specific todo
{
  todo(id: 4){
    title
    createdat
    updatedat
    id
    completed
  }
}

# Deleting a todo
mutation{
  deleteTodo(id:3)
}

# Updating a todo
mutation{
  updateTodo(todoInput:{id: 1, title: "programming"}){
    id
    title
  }
}
```

> Next we are going to look at authentication
