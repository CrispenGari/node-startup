### Authentication

We are going to implement authentication using `graphql`, `mikroORM`, `postgres` and `express`. We will work from start to finish on the implementation of the backend authentication. We are going to use the `CRUD` operation simple todo application as the base and move on to creating some advanced resolvers along the way.

### Dev Tools

Let's install a beautiful graphQL play ground extension on our chrome browser. The extension can be found [here](https://chrome.google.com/webstore/detail/graphql-playground-for-ch/kjhjcgclphafojaeeickcokfbhlegecd?hl=en)

### Starting the Postgres database server

```
psql -U postgres
```

### Creating a new database called users

This database will be responsible for storing all the users information.

```
CREATE DATABASE users;
```

### Selecting a database

```
postgres=# \c users;
```

### Package installation

We are going to use the packages that we installed from the previous example in this example. We are going to add others as we go.

### Creating a `User` entity.

We are going to create a user `entity` in the `entities` folder in the `src`.

```ts
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class User {
  @PrimaryKey()
  id: number;

  @Property({ type: "date" })
  createdAt = new Date();

  @Property({ type: "text", nullable: false })
  password: string;

  @Property({ type: "text", unique: true, nullable: false })
  username: string;

  @Property({ type: "text", nullable: false })
  email: string;
}
```

The `mikro-orm.config.ts` will be looking as follows:

```ts
import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { User } from "./entities/User";
export default {
  entities: [User],
  migrations: {
    path: path.join(__dirname, "./migrations"),
    pattern: /^[\w-]+\d+\.[t|j]s$/,
    tableName: "users",
  },
  dbName: "users",
  password: "root",
  user: "postgres",
  port: 5432,
  debug: process.env.NODE_ENV !== "production",
  type: "postgresql",
} as Parameters<typeof MikroORM.init>[0];
```

Then the `server.ts` will be looking as follows:

```ts
import { MikroORM } from "@mikro-orm/core";
import { User } from "./entities/User";
import mikroOrmConfig from "./mikro-orm.config";

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getMigrator().up();
  const user = orm.em.create(User, {
    username: "crispen",
    email: "crispen@gmail.com",
    password: "crispen",
  });
  await orm.em.persistAndFlush(user);
};

main()
  .then(() => {})
  .catch((error) => console.error(error));
```

### Running migrations

To run migration we are going to run the following command:

```
npx mikro-orm migration:create
```

- Since we are going to have more migrations it's good to create a script that will run a migration. For that I'm going to jump into my `package.json` file and under `scripts` I'm going to add the following script:

```json
 "scripts": {
    ...
    "create:migration": "mikro-orm migration:create"
  }
```

Now when you want to run a migration you just have to run the following command:

```
yarn create:migration
```

> Everything is working now, we need to set up the graphql server. We are going to use the `apollo-server-express` and `type-graphql`. And our resolvers will be in the `resolvers` folders.

1. `User` entity:
   The user entity will be looking as follows for now.

```ts
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class User {
  @Field(() => Int)
  @PrimaryKey()
  id: number;

  @Field(() => String)
  @Property({ type: "date" })
  createdAt = new Date();

  //   @Field(() => String)
  @Property({ type: "text", nullable: false })
  password!: string;

  @Field(() => String)
  @Property({ type: "text", unique: true, nullable: false })
  username!: string;

  @Field(() => String)
  @Property({ type: "text", nullable: false })
  email!: string;
}
```

2. Now it's time to create our resolvers. The first thing that we have to do is to create a mutation that will be able to register the user. The mutation will be called `register`. We don't want to save the user's password as plain text therefore we are going to use a hashing algorithm called `argon2` which can be found [here](https://github.com/ranisalt/node-argon2). WE can also use `bcrypt` but `argon2` is better. We need to install it first so to install it we are going to run the following command:

```
yarn add argon2
<!-- Types -->
yarn add -D @types/argon2
```

1. Registering a user `user` resolver.

- We are going to create a UserInput type by decorating the `UserInput` with the `InputType` from `type-graphql`. This will allow us to write cleaner code. Instead of passing a lot of `Arg`s for each field we are now passing a single `Arg` as an object of type `UserInput`

- We are going to create `UserResponse` which returns two things an object of `error` or `user`. The `Error` type will be an `ObjectType` with two fields `name` and `message`. All these fields are not optional.

- **Note** - `InputTypes` are for `Arg` and `ObjectTypes` are for `Mutation` and `Queries` return types.

```ts
import { Arg, Ctx, Field, InputType, Mutation, Resolver } from "type-graphql";
import { User } from "../entities/User";
import { UserContext } from "../types";
import argon2 from "argon2";

@InputType()
class UserInput {
  @Field(() => String)
  username!: string;

  @Field(() => String)
  email!: string;

  @Field(() => String)
  password!: string;
}

@ObjectType()
class Error {
  @Field(() => String)
  name: string;

  @Field(() => String)
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => Error, { nullable: true })
  error?: Error;
}

@Resolver()
export class UserResolver {
  // REGISTER
  @Mutation(() => UserResponse)
  async register(
    @Ctx() { em }: UserContext,
    @Arg("user", () => UserInput, { nullable: true }) user: UserInput
  ): Promise<UserResponse | null> {
    if (user.username.length <= 3) {
      return {
        error: {
          message: "username must have at least 3 characters",
          name: "username",
        },
      };
    }
    if (user.password.length <= 3) {
      return {
        error: {
          message: "password must have at least 3 characters",
          name: "password",
        },
      };
    }
    const hashed = await argon2.hash(user.password);
    const _user = em.create(User, {
      email: user.email.toLocaleLowerCase(),
      password: hashed,
      username: user.username.toLocaleLowerCase(),
    });
    try {
      await em.persistAndFlush(_user);
    } catch (error) {
      if (
        error.code === "23505" ||
        String(error.detail).includes("already exists")
      ) {
        return {
          error: {
            message: "username is taken by someone else",
            name: "username",
          },
        };
      }
    }

    return { user: _user };
  }
}
```

- Now if i go to the `graphQL` playground and make the following mutation:

```
mutation{
  register(user:{username: "gari", password: "gari", email: "gari@gmail.com"}) {
    username
    email
    createdAt
  }
}
```

I will get a new registered user

```json
{
  "data": {
    "register": {
      "username": "gari",
      "email": "gari@gmail.com",
      "createdAt": "1629138210930"
    }
  }
}
```

2. Login a `user` resolver.
   We are going to make this very simple and straight forward when it comes to login the user. We are going to use the `username` and `password` note that you can use both username and password to login the user. If you go to the graphQL playground and make the following mutation:

```
mutation{
 login (user: {username: "gari", password: "gari"}){
   user {
     email,
     username
     createdAt
     id
   }
   error {
     message
     name
   }
 }
}
```

You will get the following response:

```json
{
  "data": {
    "login": {
      "user": {
        "email": "gari@gmail.com",
        "username": "gari",
        "createdAt": "1629138211000",
        "id": 6
      },
      "error": null
    }
  }
}
```

> Now that we are able to login the `user` and creating a user, the next step is to make sure that we keep the user login in. We are going to use store the user session in the browser. T do this we are going to use `express-session` and `redis`. We are going to use the `connect-redis` [middleware](https://github.com/tj/connect-redis) and the [express session](https://github.com/expressjs/session) middleware. So let's install those packages:

### Installation of `connect-redis`, `redis` and `express-session`

```
yarn add redis connect-redis express-session
<!-- Add types -->
yarn add -D @types/redis @types/connect-redis  @types/express-session
```

### Staring the redis server.

To start the redis server run the following command.

```
$ redis-server
```

Once the server is running we are going to setup the express-session middleware in the `server.ts` The code looks as follows:

```ts
import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import mikroOrmConfig from "./mikro-orm.config";
import express, { Application, Response, Request } from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { __port__ } from "./constants";
import { HelloResolver } from "./resolvers/hello";
import { UserResolver } from "./resolvers/user";

import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getMigrator().up();

  const app: Application = express();

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  app.use(
    session({
      store: new RedisStore({ client: redisClient, disableTouch: true }),
      saveUninitialized: false,
      secret: "secret",
      resave: false,
      name: "user",
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        secure: false, // https when true
        sameSite: "lax",
      },
    })
  );
  /*
  Since it is a graphql server we are don't care
  about other routes.
  */
  app.get("/", (_req: Request, res: Response) => {
    return res.status(200).redirect("/graphql");
  });
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      validate: false,
      resolvers: [HelloResolver, UserResolver],
    }),
    context: ({ req, res }) => ({ em: orm.em, req, res }),
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app });
  app.listen(__port__, () =>
    console.log("The server has started at port: %d", __port__)
  );
};

main()
  .then(() => {})
  .catch((error) => console.error(error));
```

- First we imported `redis`, `express-session` and `connect-redis`. We will then create a redis store and create a session of name `user` that expires after 10 years. **Make sure that the `session` middleware comes before `apolloServer.applyMiddleware({app})`**.

- We also changed the context in the `ApolloServer` instance and pass down `req` and `res` objects to our resolvers. We also changed the type of `UserContext` in the `types/index.ts` and it's now looking as follows:

```ts
import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import express from "express";
export type UserContext = {
  em: EntityManager<IDatabaseDriver<Connection>>;
  req: express.Request & { session?: any };
  res: express.Response;
};
```

- Now in the `user` resolver. On sucessiful authentication we set the push the userId to the session as follows:

```ts
req.session.userId = _userFound.id;
```

- Now our login Mutation will be looking as follows:

```ts
 @Mutation(() => UserResponse)
  async login(
    @Ctx() { em, req }: UserContext,
    @Arg("user", () => UserInput, { nullable: true }) user: UserInput
  ): Promise<UserResponse | null> {
    const _userFound = await em.findOne(User, {
      username: user.username.toLocaleLowerCase(),
    });
    if (!_userFound) {
      return {
        error: {
          message: "username does not exists",
          name: "username",
        },
      };
    }
    const compare = await argon2.verify(_userFound?.password, user?.password);
    if (!Boolean(compare)) {
      return {
        error: {
          name: "password",
          message: "invalid password",
        },
      };
    } else {
      req.session.userId = _userFound.id; // add the userid to the session.
      return { user: _userFound };
    }
  }
```

- Next we will then create a new mutation that will get the user if he's logged in the `user` resolver as follows.

```ts
  @Query(() => User, { nullable: true })
  async user(@Ctx() { em, req }: UserContext): Promise<User | null> {
    if (!req.session.userId) {
      return null;
    }
    const user = await em.findOne(User, {
      id: req.session.userId,
    });
    return user;
  }
```

### The code that we have so far in the `user` resolver:

The following is the code that we have so far in our `user` resolver. Next we are going to implement the logout.

````ts
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { User } from "../entities/User";
import { UserContext } from "../types";
import argon2 from "argon2";

@InputType()
class UserInput {
  @Field(() => String)
  username!: string;

  @Field(() => String, { nullable: true })
  email!: string;

  @Field(() => String)
  password!: string;
}

@ObjectType()
class Error {
  @Field(() => String)
  name: string;

  @Field(() => String)
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => Error, { nullable: true })
  error?: Error;
}

@Resolver()
export class UserResolver {
  // GET USER
  @Query(() => User, { nullable: true })
  async user(@Ctx() { em, req }: UserContext): Promise<User | null> {
    if (!req.session.userId) {
      return null;
    }
    const user = await em.findOne(User, {
      id: req.session.userId,
    });
    return user;
  }
  // REGISTER
  @Mutation(() => UserResponse)
  async register(
    @Ctx() { em, req }: UserContext,
    @Arg("user", () => UserInput, { nullable: true }) user: UserInput
  ): Promise<UserResponse | null> {
    if (user.username.length <= 3) {
      return {
        error: {
          message: "username must have at least 3 characters",
          name: "username",
        },
      };
    }
    if (user.password.length <= 3) {
      return {
        error: {
          message: "password must have at least 3 characters",
          name: "password",
        },
      };
    }
    const hashed = await argon2.hash(user.password);
    const _user = em.create(User, {
      email: user.email.toLocaleLowerCase(),
      password: hashed,
      username: user.username.toLocaleLowerCase(),
    });
    try {
      await em.persistAndFlush(_user);
    } catch (error) {
      if (
        error.code === "23505" ||
        String(error.detail).includes("already exists")
      ) {
        return {
          error: {
            message: "username is taken by someone else",
            name: "username",
          },
        };
      }
    }
    req.session.userId = _user.id;
    return { user: _user };
  }

  // LOGIN
  @Mutation(() => UserResponse)
  async login(
    @Ctx() { em, req }: UserContext,
    @Arg("user", () => UserInput, { nullable: true }) user: UserInput
  ): Promise<UserResponse | null> {
    const _userFound = await em.findOne(User, {
      username: user.username.toLocaleLowerCase(),
    });
    if (!_userFound) {
      return {
        error: {
          message: "username does not exists",
          name: "username",
        },
      };
    }
    const compare = await argon2.verify(_userFound?.password, user?.password);
    if (!Boolean(compare)) {
      return {
        error: {
          name: "password",
          message: "invalid password",
        },
      };
    } else {
      req.session.userId = _userFound.id;
      return { user: _userFound };
    }
  }
}```
````

The logout will be much simpler all we need to do is to destroy the session. The mutation looks as follows:

```ts
 @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: UserContext): Promise<boolean> {
    return new Promise((resolved, rejection) => {
      req.session.destroy((error: any) => {
        res.clearCookie('user')
        if (error) {
          return rejection(false);
        }
        return resolved(true);
      });
    });
  }
```

### Reset Password.

We are going to handle the reset password logic from the backend and we move to the frontend. The workflow will be as follows:

1. The user will send us a reset notification
2. We are going to check if the user exists in the database
3. We are going to generate a new token that will expire in an hour
4. We are going to store the token in the redis in memory database and send the link to the user's email.
5. When the user will be then redirected to the reset password page on the frontend.
6. The user will send us his/her new password
7. We hash the password and update the user's password in the database.

For sending emails we are going to use `nodemailer` and for generating tokens we are going to use `uuid`.
