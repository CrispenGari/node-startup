## JsonWebTokens Invalidation Typeorm, TypeGraphQL and MySQL

In this one we are going to create a GraphQL api that wll be able to handle authentication using `jwt` tokens. We are also going to learn how to invalidate tokens using token versions.

### Getting started

To get the boiler plate code for this project run

```
npx @crispengari/node-backend
```

### What are we going to use?

We are going to use the following techs:

1. GraphQL
2. TypeORM
3. TypeScript
4. TypeGraphQL
5. ApolloServerExpress
6. MySQL

### Installations.

The following packages are going to be installed for this project

1. typeorm, reflect-metadata and mysql2

```shell
yarn add typeorm reflect-metadata mysql2
```

2. graphql, apollo-server-express and type-graphql

```shell
yarn add express graphql apollo-server-express type-graphql
```

3. uuid

```shell
yarn add uuid
# types
yarn add -D @types/uuid
```

4. argorn2

```shell
yarn add argon2
# types
yarn add -D @types/argon2
```

5. Installing `jwt`

```shell
yarn add jsonwebtoken && yarn add -D @types/jsonwebtoken
```

6. cookie-parser

```shell
yarn add cookie-parser && yarn add -D @types/cookie-parser
```

### Connecting to the database.

First we need to create a database using mysql command line by running the following command:

```sql
CREATE DATABASE IF NOT EXISTS users;
```

We are going to create a `ormconfig.json` in the root folder and it looks as follows:

```json
{
  "type": "mysql",
  "host": "localhost",
  "port": 3306,
  "username": "root",
  "password": "root",
  "database": "users",
  "synchronize": true,
  "logging": true,
  "entities": ["src/entities/**/*.ts"]
}
```

`"entities"`: is pointing where are we going to write our entities, in our case we are going to write one Entity which is User.

### Creating a Server.

Our basic server code will look as follows:

```ts
// src/server.ts

import "dotenv/config";
import "reflect-metadata";
import express, { Application } from "express";
import cors from "cors";
import { __cookieName__, __port__ } from "./constants";
import { createConnection } from "typeorm";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { resolvers } from "./resolvers";
import router from "./routes";
(async () => {
  await createConnection();
  const app: Application = express();
  app.use(router);
  app.use(cors());
  const apolloSever = new ApolloServer({
    schema: await buildSchema({
      resolvers: resolvers,
      validate: false,
    }),
    context: ({ req, res }) => ({
      req,
      res,
    }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground({})],
  });

  await apolloSever.start();
  apolloSever.applyMiddleware({ app });
  app.listen(__port__);
})()
  .then(() => console.log("The server has started at port: %d", __port__))
  .catch((err) => console.error(err));
```

### Environmental variables

We need tow environmental variables which are:

1. REFRESH_TOKEN_SECRETE
2. ACCESS_TOKEN_SECRETE

Which can be created by running:

```ts
import { randomBytes } from "crypto";
console.log(randomBytes(50).toString("hex"));
```

My `.env` file looks as follows:

```shell
# environment variables here

# JWT TOKENS
REFRESH_TOKEN_SECRETE=64cdb9e81b2ddb0db25a71327b1005a937cf4b2e7253206b138141bbd9800dbdb528d293404213e76b0051d6ada4d94245f1
ACCESS_TOKEN_SECRETE=cba1b60dafd86734e9bc19b2c5d64054f6b6b44671bd5a57d680aa635e8e45784e99e20a28b982fc3dc8558c88d42485f535
```

### User Entity and User Object type

Next we are going to create a UserEntity in the `entities/User.ts` file. This entity will also map to the user object type.

```ts
import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity({ name: "users" })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true, type: "bigint" })
  id: number;
  @Field(() => String)
  @Column({ type: "text", nullable: false, unique: true })
  userId: string;

  @Field(() => String)
  @Column({ type: "text", nullable: false, unique: true })
  username: string;

  @Column({ type: "text", nullable: false })
  password: string;

  @Field(() => Int)
  @Column({ type: "int", nullable: false, default: 0 })
  tokenVersion: number;
}
```

### Resolvers

1. Register Resolver

We are going to register the user and then put the refresh and access token to the browser cookie.

```ts
import { User } from "../../entities/User";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";

import { hash } from "argon2";
import { v4 as uuid_v4 } from "uuid";
import { ContextType } from "../../types";
import { generateAccessToken, generateRefreshToken } from "src/auth";
import {
  __cookieAccessTokenName__,
  __cookieRefreshTokenName__,
} from "src/constants";

@Resolver()
export class RegisterResolver {
  @Mutation(() => User)
  async register(
    @Arg("username", () => String) username: string,
    @Arg("password", () => String) password: string,
    @Ctx() { res }: ContextType
  ): Promise<User> {
    const user = await User.findOne({
      where: {
        username,
      },
    });
    if (user) {
      throw new Error("user already taken");
    }
    if (username.length < 3) {
      throw new Error("username must be at least 3 chars");
    }
    if (password.length < 3) {
      throw new Error("password must be at least 3 chars");
    }
    password = await hash(password);
    const userId = uuid_v4();

    const _user = await User.create({
      username,
      password,
      userId,
    }).save();
    const accessToken = generateAccessToken(_user);
    const refreshToken = generateRefreshToken(_user);
    // put them to the cookie
    res.cookie(__cookieRefreshTokenName__, refreshToken);
    res.cookie(__cookieAccessTokenName__, accessToken);
    return _user;
  }
}
```

2. Login resolver.

We are going to check user's credentials aganist the ones that we have in the database and authentcate the user by setting refresh and access tokens.

```ts
import { User } from "../../entities/User";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";

import { verify } from "argon2";
import { ContextType } from "../../types";
import { generateAccessToken, generateRefreshToken } from "src/auth";
import {
  __cookieAccessTokenName__,
  __cookieRefreshTokenName__,
} from "../../constants";

@Resolver()
export class LoginResolver {
  @Mutation(() => User)
  async login(
    @Arg("username", () => String) username: string,
    @Arg("password", () => String) password: string,
    @Ctx() { res }: ContextType
  ): Promise<User> {
    const user = await User.findOne({
      where: {
        username,
      },
    });
    if (!user) {
      throw new Error("no user");
    }
    const valid = await verify(user.password, password);
    if (!valid) throw new Error("invalid password");
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    // put them to the cookie
    res.cookie(__cookieRefreshTokenName__, refreshToken);
    res.cookie(__cookieAccessTokenName__, accessToken);
    return user;
  }
}
```

3. Logout resolver.
   To logout the user we just need to set the refresh tokens and access tokens to null in the cookie, or we can just clear cookies.

```ts
import { ContextType } from "../../types";
import { Ctx, Mutation, Resolver } from "type-graphql";
import {
  __cookieAccessTokenName__,
  __cookieRefreshTokenName__,
} from "../../constants";
@Resolver()
export class LogoutResolver {
  @Mutation(() => Boolean)
  async logout(@Ctx() { res }: ContextType): Promise<Boolean> {
    res.clearCookie(__cookieAccessTokenName__);
    res.clearCookie(__cookieRefreshTokenName__);
    return true;
  }
}
```

4. User resolver.
   To find the user we are just going to grab the userId from the request object and search for it in the database

```ts
import { User } from "../../entities/User";
import { Ctx, Query, Resolver } from "type-graphql";
import { ContextType } from "src/types";

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async user(@Ctx() { req }: ContextType): Promise<User | undefined> {
    if (!req.userId) {
      return undefined;
    }
    return await User.findOne({
      where: {
        userId: req.userId,
      },
    });
  }
}
```

5. Invalidate Token resolver.

To invalidate the token we just need to increase the token version.

```ts
import { User } from "../../entities/User";
import { ContextType } from "src/types";
import { Ctx, Mutation, Resolver } from "type-graphql";
import { getConnection } from "typeorm";

@Resolver()
export class InvalidateTokenResolver {
  @Mutation(() => Boolean)
  async invalidateToken(@Ctx() { req }: ContextType): Promise<boolean> {
    if (!req.userId) return false;
    await getConnection().getRepository(User).increment(
      {
        userId: req.userId,
      },
      "tokenVersion",
      1
    );
    return true;
  }
}
```

### Creating the middleware function.

Next we are going to create an express middleware function that will check if the user is authenticated or not. This middleware will be in `middlewares/index.ts` file.

```ts
import { NextFunction, Response } from "express";
import { verify } from "jsonwebtoken";
import {
  __cookieAccessTokenName__,
  __cookieRefreshTokenName__,
} from "src/constants";
import { User } from "src/entities/User";

import { generateRefreshToken, generateAccessToken } from "../auth";

export const authenticationMiddlewareFn = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const refreshToken = req.cookies[__cookieRefreshTokenName__];
  const accessToken = req.cookies[__cookieAccessTokenName__];
  if (!refreshToken && !accessToken) {
    return next();
  }
  try {
    const payload = verify(accessToken, process.env.ACCESS_TOKEN_SECRETE!);
    req.userId = (payload as any).userId;
    return next();
  } catch {}

  let data;

  try {
    data = verify(refreshToken, process.env.REFRESH_TOKEN_SECRETE!) as any;
  } catch {
    return next();
  }
  const user = await User.findOne({
    where: {
      userId: data.userId,
    },
  });
  if (!user || user.tokenVersion !== data.version) {
    return next();
  }
  res.cookie(__cookieAccessTokenName__, generateRefreshToken(user));
  res.cookie(__cookieRefreshTokenName__, generateAccessToken(user));
  req.userId = user.userId;
  return next();
};
```

Now in our `server.ts ` we are going to make sure the user is authenticated before all other middlewares runs that depends on the checking of the user as follows:

```ts
import "dotenv/config";
import "reflect-metadata";
import express, { Application } from "express";
import cors from "cors";
import { __port__ } from "./constants";
import { createConnection } from "typeorm";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { resolvers } from "./resolvers";
import cookieParser from "cookie-parser";
import router from "./routes";
import { authenticationMiddlewareFn } from "./middlewares";

(async () => {
  await createConnection();
  const app: Application = express();
  app.use(cookieParser());
  app.use(cors());
  app.use(authenticationMiddlewareFn);
  app.use(router);
  const apolloSever = new ApolloServer({
    schema: await buildSchema({
      resolvers: resolvers,
      validate: false,
    }),
    context: ({ req, res }) => ({
      req,
      res,
    }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground({})],
  });

  await apolloSever.start();
  apolloSever.applyMiddleware({ app });
  app.listen(__port__);
})()
  .then(() => console.log("The server has started at port: %d", __port__))
  .catch((err) => console.error(err));
```

### Making graphql queries and mutations

Now we can go to http://localhost:3002/graphql and make queries and mutations to our graphql api.

1. Register user

Mutation

```
mutation{
  register(username: "username", password: "password"){
    userId
    username
  }
}

```

Result:

```json
{
  "data": {
    "register": {
      "userId": "6cdb1307-38d9-4bf9-8a94-0373b761c0e3",
      "username": "username"
    }
  }
}
```

2. Login in the user

Mutation

```
mutation{
  login(username: "username", password: "password"){
    userId
    username
  }
}
```

Result:

```json
{
  "data": {
    "login": {
      "userId": "6cdb1307-38d9-4bf9-8a94-0373b761c0e3",
      "username": "username"
    }
  }
}
```

3. User Query

Query

```
{
  user{
    username
    tokenVersion
    userId
  }
}
```

Result:

```json
{
  "data": {
    "user": {
      "username": "username",
      "tokenVersion": 1,
      "userId": "6cdb1307-38d9-4bf9-8a94-0373b761c0e3"
    }
  }
}
```

4. Invalidating the token

Mutation

```
mutation {
  invalidateToken
}

```

Result:

```json
{
  "data": {
    "invalidateToken": true
  }
}
```

5.Loging out the user

Mutation

```
mutation{
  logout
}

```

Result:

```json
{
  "data": {
    "logout": true
  }
}
```

That's all i wanted to show in this one.
