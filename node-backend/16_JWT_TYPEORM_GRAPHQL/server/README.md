### JWT authentication Server

I will explain every single line of code that may seem confusing in the README.md file.

The goal of this is to create a server that will authenticate the user using jwt. We will be using a lot of packages so i will walk through the installation of all the packages that we are going to use.

To start up this project we are going to run the following command:

```shell
npx @crispengari/node-backend
```

This will generate a boiler plate code for us with express application ready to run.

### Installations

1. typeorm, reflect-metadata and pg

To install these packages we are going to run the following command.

```shell
yarn add typeorm reflect-metadata pg && yarn add -D @types/pg
```

2. bcryptjs
   We need this package to hash password before storing them to the database. Feel free to use argon2 but they just work the same.

```shell
yarn add bcryptjs && yarn add -D @types/bcryptjs
```

3. uuid
   We are going to generate unique id's so we need to install this package

```shell
yarn add uuid && yarn add -D @types/uuid
```

4. type-graphql, apollo-server-express, class-validator and graphql
   To install these packages we are going to run the following command:

```shell
yarn add graphql class-validator apollo-server-express type-graphql && yarn add -D @types/graphql
```

5. jsonwebtoken
   To install jwt we are going to run the following command:

```shell
yarn add jsonwebtoken && yarn add @types/jsonwebtoken
```

6. cookie-parser
   We also need to install `cookie-parser` so that we can use it as a middleware to our express application.

```shell
yarn add cookie-parser && yarn add -D @types/cookie-parser
```

### Connecting to our database

First we want to create a database called `jwt` we are going to run the following command in `psql` command line:

```shell
CREATE DATABASE jwt;
```

Next we are going to create a `ormconfig.json` file in the root directory and add the following configs.

```json
{
  "type": "postgres",
  "host": "localhost",
  "port": 5432,
  "username": "postgres",
  "password": "root",
  "database": "jwt",
  "synchronize": true,
  "logging": true,
  "entities": ["src/entities/**/*.ts"]
}
```

These are the connection properties that we need. Note that to find the port number in postgres using `psql` you run the following command:

```sql
postgres=# SELECT * FROM pg_settings WHERE name = 'port';
```

### Environment variables

Next we need to create environment variables four our `REFRESH_TOKEN_SECRETE` and `ACCESS_TOKEN_SECRETE`. To initialize these secrete keys we are going to use a node library called `crypto` and we will get by running

```ts
import j from "crypto";
console.log(j.randomBytes(50).toString("hex"));
```

Create two tokens and put them in an `.env` file mine looks as follows:

```.env
# jwt secretes
REFRESH_TOKEN_SECRETE = 00db61f55f4650f38557a82dbb3a1b083e0e092f7a27331f4ad9872c7a2cbda96e67009ba53c9ec333828e205dc1b6ed4063
ACCESS_TOKEN_SECRETE = 5540f64ebf40ab767bfbded884a186f3877dfb3c8e328aa6e344215d6b2631ee2cacb6ca156d43eff187c9b96a0a688fd205
```

### User entity

Next we are going to create a UserEntity inside the `entities` folder and it looks as follows:

```ts
import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity({ name: "users" })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column({ type: "text", unique: true, nullable: false })
  userId: string;

  @Field(() => String)
  @Column({ type: "text", unique: true, nullable: false })
  email: string;

  @Column({ type: "text", nullable: false })
  password: string;

  @Column("int", { default: 0 })
  tokenVersion: number;
}
```

We are going to track the current version of the token using the `tokenVersion` field, which we are not exposing to graphql. We are also going to use uuid to generate userId, so that we don't bother to use the `PrimaryGeneratedId` id. After this we can go ahead and create two functions in the `auth/index.ts` which will generate tokens for us.

```ts
import jwt from "jsonwebtoken";
import { User } from "../entities/User";
export const createAccessToken = (user: User): string => {
  return jwt.sign(
    {
      userId: user.userId,
      tokenVersion: user.tokenVersion,
    },
    process.env.ACCESS_TOKEN_SECRETE!,
    {
      expiresIn: "10m",
    }
  );
};

export const createRefreshToken = (user: User): string => {
  return jwt.sign(
    {
      userId: user.userId,
      tokenVersion: user.tokenVersion,
    },
    process.env.REFRESH_TOKEN_SECRETE!,
    {
      expiresIn: "7d",
    }
  );
};
```

**Note** Our refresh tokens are going to be stored in the browser cookie and they expires after 7 days. We are going to create a simple function that will store the refresh token to the browser cookie. This function will be also in the `/auth/index.ts` and it looks as follows:

```ts
export const storeRefreshToken = (res: Response, token: string): void => {
  res.cookie("jwt", token, {
    httpOnly: true,
    path: "/refresh-token",
  });
};
```

So we will get the refresh token and save it in browser cookie and with a name `jwt`. We have set tha path to `/refresh-token` which is the best practice to only set the cookie when the route `/refresh-token` is called.

Now we are ready to create our GraphQL resolvers. All resolvers that are related to the user will be located in the `resolvers/user` folder.

1. Register Resolver

The register resolver looks as follows:

```ts
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { v4 as uuid_v4 } from "uuid";
import { hash } from "bcryptjs";
import { User } from "../../entities/User";
import {
  storeRefreshToken,
  createRefreshToken,
  createAccessToken,
} from "../../auth";
import { ContextType } from "../../types";
import { AuthUserObjectType } from "./ObjectTypes";
@Resolver()
export class RegisterResolver {
  @Mutation(() => AuthUserObjectType)
  async register(
    @Arg("email", () => String) email: string,
    @Arg("password", () => String) password: string,
    @Ctx() { res }: ContextType
  ): Promise<AuthUserObjectType> {
    const user = await User.findOne({
      where: { email: email.toLocaleLowerCase().trim() },
    });
    if (user) {
      throw new Error("email already taken");
    }
    if (password.length < 3) {
      throw new Error("the password must be at least 3 chars");
    }
    password = await hash(password, 12);
    const userId: string = uuid_v4();
    const _user = await User.create({
      email,
      password,
      userId,
    }).save();
    storeRefreshToken(res, createRefreshToken(_user));
    return {
      user: _user,
      accessToken: createAccessToken(_user),
    };
  }
}
```

We will get the user email, and password and check if they meet our requirements, if they then we are going to create a new user, then store the refresh token to the user's browser as a cookie, then we will return that user and the jwt accessToken.

2. Login the user

The resolver looks as follows:

```ts
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { compare } from "bcryptjs";
import { User } from "../../entities/User";
import { AuthUserObjectType } from "./ObjectTypes";
import {
  createAccessToken,
  createRefreshToken,
  storeRefreshToken,
} from "../../auth";
import { ContextType } from "../../types";
@Resolver()
export class LoginResolver {
  @Mutation(() => AuthUserObjectType)
  async login(
    @Arg("email", () => String) email: string,
    @Arg("password", () => String) password: string,
    @Ctx() { res }: ContextType
  ): Promise<AuthUserObjectType> {
    const user = await User.findOne({
      where: { email },
    });
    if (!user) {
      throw new Error("invalid email");
    }
    const valid = await compare(password, user.password);
    if (!valid) {
      throw new Error("invalid password");
    }
    storeRefreshToken(res, createRefreshToken(user));
    return {
      user,
      accessToken: createAccessToken(user),
    };
  }
}
```

We are going to check the user credentials against the the one that we have in the database. If the credentials matches then we are going to store a jwt refreshToken into the user's browser cookie and return teh user and the accessToken.

3. Logout the user

This is simple as to set the refreshToken to an empty string and it looks as follows:

```ts
import { ContextType } from "../../types";
import { Ctx, Mutation, Resolver } from "type-graphql";
import { storeRefreshToken } from "../../auth";
@Resolver()
export class LogoutResolver {
  @Mutation(() => Boolean)
  async logout(@Ctx() { res }: ContextType): Promise<Boolean> {
    storeRefreshToken(res, "");
    // you can clear the cookie if you want by calling
    //  res.clearCookie(__cookieName__)
    return true;
  }
}
```

4. Revoking tokens

This is done for security reasons. To revoke the token we are just going to change the version number of the token.

> This will prevent users to get new access tokens using the previous versions of refresh tokens.

```ts
import { User } from "../../entities/User";
import { Arg, Mutation, Resolver } from "type-graphql";
import { getConnection } from "typeorm";

/*
To revoke the token we are just going to 
change the version number of the token

*/
@Resolver()
export class RevokeTokenResolver {
  @Mutation(() => Boolean)
  async revokeRefreshTokensForUser(
    @Arg("userId", () => String) userId: string
  ): Promise<Boolean> {
    await getConnection()
      .getRepository(User)
      .increment({ userId: userId }, "tokenVersion", 1);
    return true;
  }
}
```

5. Getting the logged in user

The User resolver is responsible for getting the current logged in user using jwt refresh token that is stored in the browser cookie. The resolver looks as follows:

```ts
import { User } from "../../entities/User";
import { ContextType } from "../../types";
import { Ctx, Query, Resolver } from "type-graphql";
import jwt from "jsonwebtoken";
@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async user(@Ctx() { req }: ContextType): Promise<User | undefined> {
    const authorization = req.headers["authorization"];
    if (!authorization) return undefined;
    try {
      const token = String(authorization).includes("Bearer")
        ? authorization.split(" ")[1]
        : authorization;
      const payload: any = jwt.verify(token, process.env.ACCESS_TOKEN_SECRETE!);
      return await User.findOne({
        where: {
          userId: payload.userId,
        },
      });
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }
}
```

So first we will check the request headers if we have the `"authorization"` header. The authorization header will be looking as follows:

```
Bearer 00db61f55f4650f38557a82dbb3a1b083e0e092f7a27331f4ad9872c7a2cbda96e67009ba53c9ec333828e205dc1b6ed4063
```

So we need only the token that we are going to verify to get the payload using jwt and find the user with the userId and return that user.

7. isAuth middleware

Is auth middleware is going to check if the user is authenticated or not in order. It will call next when the it is able to pass the test:

```ts
// resolvers/middleware/isAuth.ts
import { ContextType } from "../../../types";
import { MiddlewareFn, NextFn } from "type-graphql";
import jwt from "jsonwebtoken";
export const isAuth: MiddlewareFn<ContextType> = (
  { context },
  next: NextFn
): Promise<any> => {
  const authorization = context.req.headers["authorization"];
  if (!authorization) {
    throw new Error("not authenticated");
  }
  try {
    const token = authorization.includes("Bearer")
      ? authorization.split(" ")[1]
      : authorization;
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRETE!);
    console.log("you payload", payload);
    context.payload = payload as any;
  } catch (err) {
    console.log(err);
    throw new Error("not authenticated");
  }

  return next();
};
```

8. Post Resolver
   We are then going to protect our post Resolver using the isAuthMiddleware in the Posts.ts file:

```ts
import { Query, Resolver, UseMiddleware } from "type-graphql";
import { isAuth } from "./middleware/isAuth";
@Resolver()
export class PostResolver {
  @Query(() => String)
  @UseMiddleware(isAuth)
  async posts(): Promise<String> {
    return JSON.stringify(
      [
        {
          caption: "hello 1",
          id: 1,
        },
        {
          caption: "hello 2",
          id: 2,
        },
      ],
      null,
      2
    );
  }
}
```

> `@UseMiddleware(isAuth)` this means we are going to get the posts when isAuth middleware calls the `next()` function. This means we are only going to get the posts when we have authenticated the user.

### Refreshing token route.

This route will be found in the `/routes/index.ts`. This will be an express route that will allow us to `/refresh-token` and it will be looking as follows:

```ts
import { Request, Response, Router } from "express";
import { __cookieName__ } from "../utils";
import jwt from "jsonwebtoken";
import { User } from "../entities/User";
import {
  createAccessToken,
  createRefreshToken,
  storeRefreshToken,
} from "../auth";
const router: Router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    name: "backend",
    language: "typescript",
    message: "hello world!",
  });
});

router.post("/refresh-token", async (req: Request, res: Response) => {
  const token = req.cookies[__cookieName__].split(" ")[1];

  if (!token) {
    return res.status(401).json({
      code: 401,
      message: "UnAuthorized",
      ok: false,
      accessToken: "",
    });
  }
  let payload: any = null;
  try {
    payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRETE!);
  } catch (error) {
    console.error(error);
    return res.status(403).json({
      code: 403,
      message: "Forbidden",
      ok: false,
      accessToken: "",
    });
  }

  const user = await User.findOne({
    where: {
      userId: payload.userId,
    },
  });

  if (!user) {
    return res.status(403).json({
      code: 403,
      message: "Forbidden",
      ok: false,
      accessToken: "",
    });
  }

  if (user.tokenVersion !== payload.tokenVersion) {
    return res.status(403).json({
      code: 403,
      message: "Forbidden",
      ok: false,
      accessToken: "",
    });
  }
  storeRefreshToken(res, createRefreshToken(user));
  return res.status(200).json({
    code: 200,
    message: "ok",
    ok: true,
    accessToken: createAccessToken(user),
  });
});
export default router;
```

Our `/refresh-token` route will be a post route which will get the token by cookie name. If we get the token
we are going to verify if the token exists using jwt. We then going to check the versions of the refresh tokens if they are the same. If we made it to this point then we are going to create a new refresh token and create a new access token and send it to our json response.

### Now we are ready to test the whole application.

We are going to graphql playground and register the user using the Register mutation which looks as follows:

```gql
mutation Register($email: String!, $password: String!) {
  register(email: $email, password: $password) {
    accessToken
    user {
      userId
      email
    }
  }
}
```

Query Variables

```json
{
  "password": "hello3",
  "email": "hello3@gmail.com"
}
```

A cookie will be set in teh browser, go to application under cookies copy the value of the cookie and we will then open postman to test if our `/refresh-token` works.

1. Go to http://localhost:3001/refresh-token and select a POST request
2. Click on cookies
3. Click Add
4. Pass your cookie name followed by the value for example it should look as follows:

```ts
jwt-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzNmVlMzg0ZS0wNDVkLTQ3NTItYTUxMy0zYTZhNGM5MjIwNjQiLCJ0b2tlblZlcnNpb24iOjAsImlhdCI6MTYzMjc0NTI2NSwiZXhwIjoxNjMzMzUwMDY1fQ.MrC9pyiP2Gxw0lYe3DMiQR8zuNb3qi5oQQgHzSWwNK8; Path=/; HttpOnly;
```

5. **Note that for the domain it's localhost**.
6. You may need to disable the path inside the `/auth/index.ts` on the `storeRefreshToken` function so that cookies can be set even of the '/' route.

```ts
// /auth/index.ts
export const storeRefreshToken = (res: Response, token: string): void => {
  res.cookie(__cookieName__, token, {
    httpOnly: true,
    // path: "/refresh-token",
  });
};
```

If you then click send you are going to get the following response:

```json
{
  "code": 200,
  "message": "ok",
  "ok": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzNmVlMzg0ZS0wNDVkLTQ3NTItYTUxMy0zYTZhNGM5MjIwNjQiLCJ0b2tlblZlcnNpb24iOjAsImlhdCI6MTYzMjc0NTI2NSwiZXhwIjoxNjMyNzQ1ODY1fQ.ZF7RB48OCZDZlwmMvnQeKtt4q6mBdouT5Qw92r_Q9cc"
}
```

> Next we are going to the frontend and create a React App using cra. Now we are going to teh client folder.
