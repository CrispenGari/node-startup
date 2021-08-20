### Authentication

We are going to implement authentication using `graphql`, `type-ORM`, `postgres` and `express`. We will work from start to finish on the implementation of the backend authentication. This is similar or almost the same as what we did in the `makro-ORM` authentication, all we have to do is to change some few files. All the files that are going to change, their code will be in this README.md file. Note that we need to install `tyoeorm` as follows:

```shell
yarn add typeorm
```

First we need to create a database and a table that will store our users. The commands are as follows:

```sql

-- CREATING AUTH USER DATABASE
CREATE DATABASE auth_user;

DROP TABLE auth_user;
-- CREATING A TABLE OF USERS
CREATE TABLE auth_user(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    password TEXT NOT NULL,
    createdAt DATE NOT NULL DEFAULT NOW(),
    username TEXT NOT NULL UNIQUE,
    email text NOT NULL
);
```

The `server.ts` will have the following code after changes:

```ts
import "reflect-metadata";
import express, { Application, Response, Request } from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { __port__ } from "./constants";
import { HelloResolver } from "./resolvers/hello";
import { UserResolver } from "./resolvers/authUser";
import { createConnection } from "typeorm";

import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import cors from "cors";
import { typeORMConfig } from "./typeorm.config";
import { AuthUser } from "./entities/AuthUser";
const main = async () => {
  const conn = await createConnection(typeORMConfig);
  await conn.runMigrations();
  const app: Application = express();
  await AuthUser.delete({});

  const RedisStore = connectRedis(session);
  const redisClient = new Redis();

  app.use(
    cors({
      credentials: true,
      origin: "http://localhost:3000",
    })
  );
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
    context: ({ req, res }) => ({ req, res, redis: redisClient }),
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, cors: false });
  app.listen(__port__, () =>
    console.log("The server has started at port: %d", __port__)
  );
};

main()
  .then(() => {})
  .catch((error) => console.error(error));
```

The `types/index.ts` changes because in the server we are no longer passing the `em` object like we did in the `makro-orm` backend all we need to do is to pass down the `req`, `res` and `redis` objects looks as follows:

```ts
import express from "express";
import { Redis } from "ioredis";
export type UserContext = {
  req: express.Request & { session?: any };
  res: express.Response;
  redis: Redis;
};
```

Our `typeORMConfig` file has the following configurations

```ts
import path from "path";
import { createConnection } from "typeorm";
import { AuthUser } from "./entities/AuthUser";

export const typeORMConfig = {
  type: "postgres",
  username: "postgres",
  database: "auth_user",
  password: "root",
  port: 5432,
  logging: true,
  entities: [AuthUser],
  migrations: [path.join(__dirname, "./migrations/*")],
  cli: {
    migrationsDir: "migration",
  },
} as Parameters<typeof createConnection>[0];
```

Our `resolvers/authUser.ts` resolver will be looking as follows:

```ts
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { AuthUser } from "../entities/AuthUser";
import { UserContext } from "../types";
import argon2 from "argon2";
import { v4 as uuid_v4 } from "uuid";
import { sendEmail } from "../utils";
import { UserInput, ResetInput } from "./inputTypes";
import { UserResponse, Email } from "./objectTypes";
import { getConnection } from "typeorm";
import { REGISTER_USER_COMMAND } from "./commands";

const ONE_HOUR: number = 60 * 60;
@Resolver()
export class UserResolver {
  // GET USER
  @Query(() => AuthUser, { nullable: true })
  async user(
    @Ctx() { req }: UserContext
  ): Promise<AuthUser | undefined | null> {
    if (!req.session.userId) {
      return null;
    }
    const user = await AuthUser.findOne({
      where: { id: Number.parseInt(req.session.userId) },
    });
    return user;
  }
  // REGISTER
  @Mutation(() => UserResponse)
  async register(
    @Ctx() { req }: UserContext,
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
    const _searchUser = await AuthUser.findOne({
      where: {
        username: user?.username?.toLocaleLowerCase(),
      },
    });
    if (_searchUser) {
      return {
        error: {
          message: "username is taken by someone else",
          name: "username",
        },
      };
    } else {
      const _user = await getConnection().query(REGISTER_USER_COMMAND, [
        user.username.toLocaleLowerCase(),
        user.email.toLocaleLowerCase(),
        hashed,
      ]);
      req.session.userId = _user[0].id;
      return {
        user: _user[0],
      };
    }
  }

  // LOGIN
  @Mutation(() => UserResponse)
  async login(
    @Ctx() { req }: UserContext,
    @Arg("user", () => UserInput, { nullable: true }) user: UserInput
  ): Promise<UserResponse | null | undefined> {
    const _userFound = await AuthUser.findOne({
      where: { username: user.username.toLocaleLowerCase() },
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
  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: UserContext): Promise<boolean> {
    return new Promise((resolved, rejection) => {
      req.session.destroy((error: any) => {
        res.clearCookie("user");
        if (error) {
          return rejection(false);
        }
        return resolved(true);
      });
    });
  }
  // Sending Email
  @Mutation(() => Email)
  async sendEmail(
    @Arg("email", () => String) email: string,
    @Ctx() { redis }: UserContext
  ): Promise<Email> {
    // Check if the email exists in the database
    const user = await AuthUser.findOne({
      where: {
        email: email.toLocaleLowerCase(),
      },
    });
    if (!user) {
      return {
        error: {
          name: "email",
          message: `There's no account corresponding to ${email}.`,
        },
      };
    }
    const token: string = uuid_v4() + uuid_v4();
    await redis.setex(token, ONE_HOUR, String(user.id));
    const message: string = `Click <a href="http://localhost:3000/reset-password/${token}">here</a> to reset your password.`;
    await sendEmail(email, message);
    return {
      message: `We have sent the password reset link to ${email}. Please reset your password and login again.`,
    };
  }
  // Resetting password
  @Mutation(() => UserResponse, { nullable: true })
  async resetPassword(
    @Arg("emailInput", () => ResetInput) emailInput: ResetInput,
    @Ctx() { redis }: UserContext
  ): Promise<UserResponse | null | undefined> {
    // Find the token
    if (emailInput.newPassword.length <= 3) {
      return {
        error: {
          message: "password must have at least 3 characters",
          name: "password",
        },
      };
    }
    const userId = await redis.get(emailInput.token);
    if (userId === null) {
      return {
        error: {
          name: "token",
          message: "could not find the token maybe it has expired",
        },
      };
    }
    // Update the user
    const hashed = await argon2.hash(
      emailInput.newPassword.toLocaleLowerCase()
    );
    const user = await AuthUser.findOne({ id: Number.parseInt(userId) });
    if (user) {
      // delete the token

      await AuthUser.update(
        { id: Number.parseInt(userId) },
        {
          password: hashed,
        }
      );
    }
    await redis.del(emailInput.token);
    if (user === null) {
      return {
        error: {
          name: "user",
          message: "the user was not found maybe the account was deleted",
        },
      };
    }
    return {
      user: user,
    };
  }
}
```

We have also changed out `AuthUser` entity it is now looking as follows in the `entities/AuthUser.ts`

```ts
import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@ObjectType()
@Entity()
export class AuthUser extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @CreateDateColumn()
  createdat: Date;

  @Column({ type: "text", nullable: false })
  password!: string;

  @Field(() => String)
  @Column({ type: "text", unique: true, nullable: false })
  username!: string;

  @Field(() => String)
  @Column({ type: "text", nullable: false })
  email!: string;
}
```

The goal of this was to learn how to connect different Stacks together preparing for a series of future projects to come.

### Docs

- [typeorm](https://typeorm.io/#/connection)
