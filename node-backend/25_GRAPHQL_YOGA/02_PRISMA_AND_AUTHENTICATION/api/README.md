### Authentication API

In this example we are going to show how to implement the `session-based-authentication` api using `prisma`, `graphql-yoga`, `express` and `express-session` server. We are going to use the [00_GETTING_STARTED](https://github.com/CrispenGari/node-startup/tree/main/node-backend/24_PRISMA/00_GETTING_STARTED) repository as a base to this.

### Prisma Client

After setting up prisma we will need to install the `prisma/client` by running the following command:

```shell
yarn add @prisma/client
```

### User model

Our `User` model will be defined in the `schema.prisma` as follows:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int   @id @default(autoincrement())
  email String @unique
  password  String
  username String @unique
}
```

After creating a user model we need to run the following command:

```shell
yarn prisma db push
```

### Setting up GraphQL

Now that we have prisma setup we can go ahead and set up graphql server with `graphql-yoga`.

```shell
yarn add graphql-yoga graphql graphql-tools lodash express-session connect-redis ioredis

# types of lodash, connect-redis and express-session

yarn add -D @types/lodash express-session connect-redis
```

After that we need to create a `schema` for that we are going to create a `schema/index.ts` file that looks as follows:

```ts
import { makeExecutableSchema } from "graphql-tools";
import { inputTypes } from "./typeDefs/inputs";
import { objectTypes } from "./typeDefs/object";
import { Query } from "./typeDefs/query";
import { Mutation } from "./typeDefs/mutation";
import { resolvers } from "./resolvers";
export const schema = makeExecutableSchema({
  typeDefs: [inputTypes, objectTypes, Query, Mutation],
  resolvers,
});
```

> Our `typeDefs` will be defined in respective files.Now we can define our resolvers which means in the `resolvers/index.ts` file we are going to have the following code in it:

```ts
import lodash from "lodash";
import { MessageMutation } from "./mutations/MessageMutation";
import { RegisterMutation } from "./mutations/RegisterMutation";
import { HelloQuery } from "./queries/HelloQuery";

export const resolvers = lodash.merge(
  {},
  HelloQuery,
  RegisterMutation,
  MessageMutation
);
```

Every time when we create a `Query`, `Mutation` and `Subscription` resolvers we come and `merge` them here in this file.

### Server

In our `server.ts` we are going to have the following code in it:

```ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import router from "./routes";
import { PrismaClient } from "@prisma/client";
import { createYoga } from "graphql-yoga";
import { schema } from "./schema";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
const prisma = new PrismaClient();

const PORT: any = 3001 || process.env.PORT;

(async () => {
  const app: express.Application = express();
  const RedisStore = connectRedis(session);
  const redisClient = new Redis();
  const yoga = createYoga({
    schema,
    context: ({ request: req, params }) => ({
      req,
      params,
      prisma,
      redis: redisClient,
    }),
    graphiql: true,
    landingPage: false,
    cors: false,
  });
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
      name: "uid",
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        secure: false, // https when true
        sameSite: "lax",
      },
    })
  );
  app.use(express.json());
  app.use(router);
  app.use("/graphql", yoga);
  app.listen(PORT);
})()
  .then(() => console.log(`The server is running on port: ${PORT}`))
  .catch((err) => console.log(err))
  .finally(async () => {
    await prisma.$disconnect();
  });
```

> Note that we are passing `prisma` as a context so that it can be accessed all over all the resolvers. We also defined the `CxtType` which is the typescript type for our context in the `types/index.ts` as follows:

```ts
import { PrismaClient, Prisma } from "@prisma/client";
import { Request } from "express";
import { GraphQLParams } from "graphql-yoga";

export interface CtxType {
  req: Request;
  params: GraphQLParams<Record<string, any>, Record<string, any>>;
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >;
}
```

### Register User Resolver

To register the user we are going to create a new user and save him in the database using `prisma`.

### Login User

### Logout User

### Refs

1. [stackoverflow.com](https://stackoverflow.com/questions/60747549/how-to-split-type-definitions-and-resolvers-into-separate-files-in-apollo-server)
2. [express-session](https://www.npmjs.com/package/express-session)
3. [02_AUTHENTICATION](https://github.com/CrispenGari/node-startup/tree/main/node-backend/07_GraphQL_TypeORM_Express_TypeScript_Postgres/02_AUTHENTICATION/backend/src/resolvers)
