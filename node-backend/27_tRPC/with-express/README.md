### tRPC with Express

In this `README` we are going to learn how we can use `tRPC` with an express server together with how we can use the `tRPC Playground`.

### Getting Started

First we need to install the packages by running the following command:

```shell
yarn add @trpc/server zod express superjson cors

#
yarn add -D @types/express @types/cors
```

### Creating `createContext` Function

We will then create a file in the called `src/context/context.ts` and add the following code in it:

```ts
import * as trpcExpress from "@trpc/server/adapters/express";
import { inferAsyncReturnType } from "@trpc/server";

export const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({ req, res });

export type Context = inferAsyncReturnType<typeof createContext>;
```

After we have created the `createContext` function we then need to create our `tRPC` instance in the file `src/trpc/trpc.ts` and add the following code in it:

```ts
import { initTRPC } from "@trpc/server";

import superjson from "superjson";
import { Context } from "../context/context";

const t = initTRPC.context<Context>().create({
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

Now we can go ahead and create our `routes` in the `src/routes/app.routes.ts` and add the following code in it:

```ts
import { publicProcedure, router } from "../trpc/trpc";
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

Now we are ready to initialize our `server` we are going to open the `src/server.ts` file and add the following code in it:

```ts
import express from "express";
import cors from "cors";
import * as trpcExpress from "@trpc/server/adapters/express";
import { createContext } from "./context/context";
export { type AppRouter } from "./routes/app.routes";
import { appRouter } from "./routes/app.routes";

const app = express();
app.use(cors());
app.use(
  "/api/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
    onError: ({ error }) => {
      if (error.code === "INTERNAL_SERVER_ERROR") {
        console.error("Something went wrong", error);
      } else {
        console.error(error);
      }
    },
  })
);

app.listen(3001, () => {
  console.log(`🚀 Server listening on port ${3001}`);
});
```

### Testing the `API` inside the `tRPC` playground.

First we need to install the `trpc-playground` package by running the following command:

```shell
yarn add trpc-playground
```

> According to the docs "tRPC Playground also supports `Fastify`, `Fetch`, `h3`, `Koa`, and `AWS Lambda`. You can import them using this format: `trpc-playground/handlers/{framework}`." Now we need to go to the `server.ts` file and modify it to look as follows:

```ts
import express from "express";
import cors from "cors";
import * as trpcExpress from "@trpc/server/adapters/express";
import { createContext } from "./context/context";
export { type AppRouter } from "./routes/app.routes";
import { appRouter } from "./routes/app.routes";
import { expressHandler } from "trpc-playground/handlers/express";

(async () => {
  const trpcApiEndpoint = "/api/trpc";
  const playgroundEndpoint = "/api/trpc-playground";
  const app = express();
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );
  app.use(
    trpcApiEndpoint,
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext,
      onError: ({ error }) => {
        if (error.code === "INTERNAL_SERVER_ERROR") {
          console.error("Something went wrong", error);
        } else {
          console.error(error);
        }
      },
    })
  );
  app.use(
    playgroundEndpoint,
    await expressHandler({
      trpcApiEndpoint,
      playgroundEndpoint,
      router: appRouter,
      request: {
        superjson: true,
      },
    })
  );
  app.listen(3001, () => {});
})().then(() => {
  console.log(`🚀 Server listening on port ${3001}`);
});
```

After that we can go to `http://localhost:3001/api/trpc-playground` and make our `hello` query as follows:

```ts
await trpc.hello.query({ name: "world" });
```

To get the following response:

```json
{
  "message": "Hello world"
}
```

You can also define variables in the playground for example:

```ts
const name: string = "This";
await trpc.hello.query({ name });
```

Output:

```json
{
  "message": "Hello This"
}
```

That's all for this one.

### Refs

1. [tRPC](https://trpc.io/docs/express)
2. [trpc-playground](https://github.com/sachinraja/trpc-playground)
