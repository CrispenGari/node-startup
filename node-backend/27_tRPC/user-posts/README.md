### tRPC and NextJs

In this Readme we are going to walk through how to use `tRPC` in a `monorepo` project with `Next.js`.

### What is TRPC?

(Transactional Remote Procedure Call) - End-to-end typesafe APIs made easy. Automatic typesafety & autocompletion inferred from your API-paths, their input data, & outputs .

### Getting started

To get started we are going to create a next application by running the following command.

```shell
yarn create next-app user-posts --typescript
```

### What we are going to build?

We are going to build a blog-site where users can create post and delete posts.

### What are we going to use?

In this project we are going to use the following technologies.

1. [Zod](https://zod.dev/) - typescript first schema validation
2. [Nodemailer](https://nodemailer.com/about/) - for sending emails
3. [NextJs](https://nextjs.org/) - for frontend
4. [tRPC](https://trpc.io/docs/quickstart)
5. [PRISMA](https://www.prisma.io/) - ORM database
6. [MySQL]() - our database driver with prisma
7. [React Hook Form](https://react-hook-form.com/) - Simple form validation with React Hook Form.
8. [JWT](https://jwt.io/) - JSON Web Token (JWT) is a compact URL-safe means of representing claims to be transferred between two parties.
9. [cookie](https://www.npmjs.com/package/cookie) - Basic HTTP cookie parser and serializer for HTTP servers. Installation. This is a Node.js module available through the npm registry.

### Installation

After a next application is installed, next we are going to install all the dependencies that we are going to use in this project. We are going to install the following:

```shell
yarn add @trpc/client @trpc/server @tanstack/react-query @trpc/react @trpc/next zod react-query superjson jotai @prisma/client react-hook-form jsonwebtoken cookie nodemailer @trpc/react-query
```

Next we are going to install some `typescript` types of the following packages

```shell
yarn add -D @types/jsonwebtoken @types/cookie @types/nodemailer
```

After all the installations has finished we are going to start writing our code. First you need to check the `tsconfig.json` file and make sure that `strict` property under compiler options is set to `true` and also `strictNullChecks` is set to `true`:

```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true
  }
}
```

We will first start by creating a folder called `server` in the `src` folder and create two files `context.ts` and `server.ts` in that folder. Let's start by opening `context.ts` and add the following code into it:

```ts
import { NextApiResponse, NextApiRequest } from "next";
export const createContext = ({
  req,
  res,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
}) => {
  return {
    req,
    res,
  };
};

export type ContextType = ReturnType<typeof createContext>;
```

Next we are going to open the `server.ts` and add the following code into it.

```ts
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ContextType } from "./context";

const t = initTRPC.context<ContextType>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const publicProcedure = t.procedure;
export const middleware = t.middleware;
export const mergeRouters = t.mergeRouters;
export const router = t.router;
```

In the server we are going to create a folder called `routes` and in this folder we are going to create our routes functionalities. We will create a file called `app.router.ts` that will contain the following code in it.

```ts
import { router, publicProcedure } from "../server";
import { z } from "zod";

export const appRouter = router({
  hello: publicProcedure
    .input(
      z.object({
        name: z
          .string()
          .min(3, { message: "minimum of 3 characters" })
          .max(10, { message: "maximum of 10 characters" }),
      })
    )
    .output(z.object({ message: z.string() }))
    .query(({ ctx, input: { name } }) => {
      return {
        message: `Hello ${name}`,
      };
    }),
});

export type AppRouter = typeof appRouter;
```

Now that we have our `hello world` trpc `procedure-call` we can go ahead and integrate it in the next application. We will start by opening the `src/utils/trpc.ts` file and add the following code it it

```ts
import { createTRPCReact } from "@trpc/react-query";
import { AppRouter } from "../server/routes/app.router";

export const trpc = createTRPCReact<AppRouter>();
```

After that we are going to open the `pages/api` folder and create a folder called `trpc` which will have a file `[trpc].ts` file in it

```ts
import { createContext } from "@/server/createContext";
import { appRouter } from "@/server/routes/app.router";
import * as trpcNext from "@trpc/server/adapters/next";

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: createContext,
  onError: ({ error }) => {
    if (error.code === "INTERNAL_SERVER_ERROR") {
      console.error("Something went wrong", error);
    } else {
      console.error(error);
    }
  },
});
```

Next we will open the `_app.tsx` file and add the following code it it:

```ts
import { AppRouter } from "@/server/routes/app.router";
import "@/styles/globals.css";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { withTRPC } from "@trpc/next";
import superjson from "superjson";
import type { AppProps } from "next/app";
import { url } from "@/constants";

const App = ({ Component, pageProps }: AppProps) => {
  return <Component {...pageProps} />;
};

export default withTRPC<AppRouter>({
  config({ ctx }) {
    const links = [
      loggerLink(),
      httpBatchLink({
        url,
      }),
    ];
    return {
      queryClientConfig: {
        defaultOptions: {
          queries: {
            staleTime: 60,
          },
        },
      },
      headers() {
        if (ctx?.req) {
          return {
            ...ctx.req.headers,
            "x-ssr": "1",
          };
        }
        return {};
      },
      links,
      transformer: superjson,
    };
  },
  ssr: false,
})(App);
```

Now we can go ahead and start the server by running the following command:

```shell
yarn dev
```

### Hello Query

When the server started we now we can go ahead and make our first query in the `pages/index.tsx`

```ts
import { Inter } from "@next/font/google";
import styles from "@/styles/Home.module.css";
import { trpc } from "../utils/trpc";

const inter = Inter({ subsets: ["latin"] });

const Home = () => {
  const { isLoading, data } = trpc.hello.useQuery({ name: "hello" });
  return (
    <div>
      <pre>
        <code>{JSON.stringify({ isLoading, data }, null, 2)}</code>
      </pre>
    </div>
  );
};

export default Home;
```

Now we should be able to see the following `JSON` object in the `dom`. This shows that our `API` is working.

```json
{
  "isLoading": false,
  "data": {
    "message": "Hello hello"
  }
}
```

### Refactoring

In this project we are going to create an authentication flow application that allows users to get authenticated and create posts. So we will need to create a lot of routes. So in our `server/routes` we are going to create a `hello.router.ts` file which will contain the procedure calls for all the mutations and `queries` for `hello` and it looks as follows:

```ts
import { z } from "zod";
import { publicProcedure, router } from "../server";

export const helloRouter = router({
  greeting: publicProcedure
    .input(
      z.object({
        name: z
          .string()
          .min(3, { message: "minimum of 3 characters" })
          .max(10, { message: "maximum of 10 characters" }),
      })
    )
    .output(z.object({ message: z.string() }))
    .query(({ ctx, input: { name } }) => {
      return {
        message: `Hello ${name}`,
      };
    }),
  fromTRPC: publicProcedure.query(({ ctx }) => "Hello from TRPC"),
});
```

Now in our `app.router.ts` we are going to modified it to look as follows:

```ts
import { router } from "../server";
import { helloRouter } from "./hello.router";
export const appRouter = router({
  hello: helloRouter,
});

export type AppRouter = typeof appRouter;
```

Which means even calling the `api` on the client will be change to.

```ts
const { isLoading, data } = trpc.hello.greeting.useQuery({ name: "hello" });
const { isLoading: l, data: fromTRPC } = trpc.hello.fromTRPC.useQuery();
```

### Database

Now that we have set up `end-to-end` schema validation in our `monorepo` we can now move on and setup the `Prisma` database. To initialize prisma in our project we are going to run the following command:

```shell
npx prisma init
```

After that a folder called `prisma` will be created in the root folder of our project and we will start building our `prisma` schema by opening the `schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id       String  @unique @default(uuid())
  email    String  @unique
  username String  @unique
  password String
  avatar   String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

So every time when we make changes to our `schema.prisma` file we need to run the following command to create migration.

```shell
npx prisma migrate dev --name
```

Example:

```shell
npx prisma migrate dev user-table
```

If you want prisma to generate relations or format your `schema.prisma` file you run the following command:

```shell
npx prisma format
```

In the `.env` file we are going to change the `DATABASE_URL` to the one one that will use `mysql` in my local computer and it will look as follows.

```shell
DATABASE_URL="mysql://root:root@localhost:3306/userpost?schema=public"
```

We will need to create a database called `user-post` by running the following command in `MySQL Client`

```sql
CREATE DATABASE IF NOT EXISTS userpost;
```

### Context

Now that we have our prisma we can go ahead and put prisma in the context, in the `server/context.ts`

```ts
import { NextApiResponse, NextApiRequest } from "next";
import { prisma } from "../utils/prisma";
export const createContext = ({
  req,
  res,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
}) => {
  return {
    req,
    res,
    prisma: prisma,
  };
};

export type ContextType = ReturnType<typeof createContext>;
```

But the `prisma` object is coming from `utils/prisma.ts` file which looks as follows

```ts
import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV === "production") {
  global.prisma = prisma;
}
```

> Note that we are declaring `global` namespace prisma and check if we have a prisma instance that is running to avoid getting a warning of initializing multiple `prisma` clients.

### Register the user

To register the user we are going to do the following for simplicity purpose.

1. create a user
2. send them a token via email.

```ts

```

```ts

```

```ts

```

```ts

```

```ts

```

```ts

```

```ts

```

```ts

```

```ts

```

```ts

```

```ts

```

```ts

```

```ts

```

### Refs

1. [Zod](https://zod.dev/)
1. [Zod](https://zod.dev/) - typescript first schema validation
1. [Nodemailer](https://nodemailer.com/about/) - for sending emails
1. [NextJs](https://nextjs.org/) - for frontend
1. [tRPC](https://trpc.io/docs/quickstart)
1. [PRISMA](https://www.prisma.io/) - ORM database
1. [MySQL]() - our database driver with prisma
1. [React Hook Form](https://react-hook-form.com/) - Simple form validation with React Hook Form.
1. [JWT](https://jwt.io/) - JSON Web Token (JWT) is a compact URL-safe means of representing claims to be transferred between two parties.
1. [cookie](https://www.npmjs.com/package/cookie) - Basic HTTP cookie parser and serializer for HTTP servers. Installation. This is a Node.js module available through the npm registry.
1. [trpc.io](https://trpc.io/docs/quickstart#querying--mutating)
1. [migrate-from-v9-to-v10](https://trpc.io/docs/migrate-from-v9-to-v10)
1. [trpc.io/docs/v9/nextj](https://trpc.io/docs/v9/nextjs)
