### tRPC and React, and Fastify

In this repository we are going to show how we can use `trpc` together with `react-js`, `fastify` and `web-sockets` subcriptions in a `mono-repo` project using `yarn-workspaces`.

### Getting started

First you will need to create a file `package.json` in the root directory of your project and add the following in it:

```json
{
  "name": "trpc-node-react",
  "private": true,
  "scripts": {},
  "workspaces": ["packages/*"]
}
```

After that we will need to create a folder called `packages` this is where our `trpc-node` app will live together with the client `react` app. Next we are going to install `concurrently` module that allows us to run the client and `trpc` server at the same time.

```shell
yarn add -W -D concurrently wsrun
```

We will modify our `start` script in the `package.json` so that it will look as follows:

```json
{
  "name": "trpc-node-react",
  "private": true,
  "scripts": {
    "start": "concurrently \"wsrun --parallel start\""
  },
  "workspaces": ["packages/*"],
  "devDependencies": {
    "concurrently": "^7.6.0",
    "wsrun": "^5.2.4"
  }
}
```

### tRPC Fastify Server

Next we are going to create a folder called server and create a file called `server.ts` in this folder that's where our `trpc` and `fastify` server will live.

Next we are going to install the packages. First you will need to navigate to the `server` folder by running the following command:

```shell
cd packages/server
```

Then after that you can now install the dependencies of the server package by running the following command:

```shell
yarn add @trpc/server fastify zod zod superjson @fastify/websocket @fastify/cors
```

> We are installing `@fastify/websocket` bacause we are going to be working with `web-sockets` in here.

Dev dependencies:

```shell
yarn add -D @types/node  ts-node-dev
```

> You will notice that the `node_modules` folder will be located in the `root` folder of the project.

After that you need to change the `tsconfig.json` in the `server` package to look as follows:

```json
{
  "compilerOptions": {
    "target": "es2018",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "module": "commonjs",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "strictPropertyInitialization": false,
    "skipLibCheck": true
  }
}
```

Then in the `package.json` file of the server we will add the following as our `start` script.

```json
{
  "scripts": {
    "start": "ts-node-dev --respawn --transpile-only src/server.ts"
  }
}
```

> Also make sure that in the `package.json` of the server the `main` property is pointing to where your `server.ts` is located.

```json
{
  "name": "server",
  "main": "src/server.ts"
  ...
}
```

### Server Code

In the `src/server.ts` file we are going to have the following code in it.

```ts
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { createContext } from "./context/context";
export { type AppRouter } from "./routes/app.routes";
import { appRouter } from "./routes/app.routes";
import Fastify from "fastify";
import cors from "@fastify/cors";

const PORT: any = process.env.PORT || 3001;
const HOST =
  process.env.NODE_ENV === "production"
    ? "0.0.0.0"
    : "localhost" || "127.0.0.1";

const fastify = Fastify({
  logger: true,
  ignoreTrailingSlash: true,
  maxParamLength: 5000,
});

fastify.register(cors, {
  credentials: true,
  origin: ["http://localhost:3000"],
});

fastify.register(fastifyTRPCPlugin, {
  prefix: "/api/trpc",
  trpcOptions: { router: appRouter, createContext },
});

fastify.listen({ port: PORT, host: HOST }, (error, address) => {
  if (error) {
    fastify.log.error(error);
    process.exit(1);
  }
  fastify.log.info(` Server is now listening on ${address}`);
});
```

So we are basically creating an `fastify` application that will serve a `tRPC` api at `/api/trpc`. So our `createContext` function will be coming from `src/context/context.ts` file and it will look as follows

```ts
import { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { inferAsyncReturnType } from "@trpc/server";

import EventEmitter from "events";
export const createContext = ({ req, res }: CreateFastifyContextOptions) => {
  const ee = new EventEmitter();
  return {
    req,
    res,
    ee,
  };
};

export type Context = inferAsyncReturnType<typeof createContext>;
```

Now we can go ahead and create the `appRouter` in our `server/routes/app.routes.ts` and it will have the following code in it:

```ts
import { router } from "../trpc/trpc";
import { helloRouter } from "./hello.router";

export const appRouter = router({
  hello: helloRouter,
});

export type AppRouter = typeof appRouter;
```

The `hello.router.ts` file will have the following code it it:

```ts
import { z } from "zod";
import { publicProcedure, router } from "../trpc/trpc";

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

Now we have a running API we can now go to our react client and set it up.

### Setting Up React client

On our react client we need to create a react app first by running the following command:

```shell
yarn create react-app client --template typescript
```

> Make sure that you are in the `packages` folder.

Inside the `client` the `tsconfig.json` will look as follows:

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": false,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

When it if finished we need to navigate to the `packages/client` and install the `server` package in our mono repo by running the following command

```
yarn add server@1.0.0
```

After installing the `server` package on the client we are then going to install the packages that we will need to setup our `tRPC` on the client by running the following command:

```shell
yarn add @trpc/client@next @trpc/server@next @trpc/react-query@next @tanstack/react-query
```

When we are done the we will need to create a folder in our `client` package called `src/utils` and create a file called `trpc.ts` and add the following code to it:

```ts
import { createTRPCReact } from "@trpc/react-query";
import { AppRouter } from "server";

export const trpc = createTRPCReact<AppRouter>();
```

Before consuming the `API` we need to create a `TRPCProvider` for that we are going to navigate to the folder called `src/providers` and create a file called `TRPCProvider.tsx` and add the following code to it:

```ts
import React, { useState } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { trpc } from "../utils/trpc";
import superjson from "superjson";
interface Props {
  children: React.ReactNode;
}
const TRPCProvider: React.FC<Props> = ({ children }) => {
  const links = [
    loggerLink(),
    httpBatchLink({
      url: "http://localhost:3001/api/trpc",
    }),
  ];
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links,
      transformer: superjson,
    })
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
};

export default TRPCProvider;
```

We will just need to wrap our application inside `trpc.Provider` which takes in a `trpcClient` and a `queryClient` and wrap it again with the `QueryClientProvider` that takes in a `queryClient`

```ts
<trpc.Provider client={trpcClient} queryClient={queryClient}>
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
</trpc.Provider>
```

Now in the `index.tsx` we will just wrap the `<App/>` with the `TRPCProvider` as follows:

```ts
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import TRPCProvider from "./providers/TRPCProvider";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <TRPCProvider>
      <App />
    </TRPCProvider>
  </React.StrictMode>
);
```

Now we can start making queries and mutations from the `server` with `E2E` typescript safe procedure calling. Note that if you make the changes on the server you don't need to install the `server` package again on the client.

### Hello World

Now we can open the `App.tsx` and query a `hello-world` query from the `server`

```ts
import React from "react";
import { trpc } from "./utils/trpc";

interface Props {}
const App: React.FC<Props> = () => {
  const { data, isFetched, isLoading } = trpc.hello.greeting.useQuery({
    name: " TRPC",
  });
  return (
    <div className="App">
      <pre>
        <code>{JSON.stringify({ data, isFetched, isLoading }, null, 2)}</code>
      </pre>
    </div>
  );
};

export default App;
```

### Starting the Server

To start the server you need to navigate to the root folder and run the following command:

```shell
yarn start
```

Both the `client` and the `server` packages will start at the same time and on the client you will be able to see some output in the dom

Output:

```json
{
  "data": {
    "message": "Hello  TRPC"
  },
  "isFetched": true,
  "isLoading": false
}
```

### Enabling Web sockets

To enable `websockets` we need to use the installed package `@fastify/websocket` package as a plugin `ws`. So we need to modify our `server` in the `src/server.ts` to look as follows:

```ts
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { createContext } from "./context/context";
export { type AppRouter } from "./routes/app.routes";
import { appRouter } from "./routes/app.routes";
import Fastify from "fastify";
import cors from "@fastify/cors";
import ws from "@fastify/websocket";

const PORT: any = process.env.PORT || 3001;
const HOST =
  process.env.NODE_ENV === "production"
    ? "0.0.0.0"
    : "localhost" || "127.0.0.1";

const fastify = Fastify({
  logger: true,
  ignoreTrailingSlash: true,
  maxParamLength: 5000,
});

fastify.register(ws);
fastify.register(cors, {
  credentials: true,
  origin: ["http://localhost:3000"],
});

fastify.register(fastifyTRPCPlugin, {
  prefix: "/api/trpc",
  trpcOptions: { router: appRouter, createContext },
  useWSS: true,
});

fastify.listen({ port: PORT, host: HOST }, (error, address) => {
  if (error) {
    fastify.log.error(error);
    process.exit(1);
  }
  fastify.log.info(` Server is now listening on ${address}`);
});
```

We will need to modify our `context/context.ts` file to look as follows:

```ts
import { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { inferAsyncReturnType } from "@trpc/server";

import EventEmitter from "events";
export const createContext = ({ req, res }: CreateFastifyContextOptions) => {
  const ee = new EventEmitter();
  return {
    req,
    res,
    ee,
  };
};

export type Context = inferAsyncReturnType<typeof createContext>;
```

Next we will then need to create a new file in the `routes` called `notifications.router.ts` which will contain a mutation and a subscription of an event `NOTIFY_EVENT` and it will look as follows:

```ts
import { observable } from "@trpc/server/observable";
import { z } from "zod";
import { Events } from "../constants";
import { publicProcedure, router } from "../trpc/trpc";

export const notificationRouter = router({
  notify: publicProcedure
    .input(z.object({ message: z.string() }))
    .mutation(async ({ ctx: { ee }, input: { message } }) => {
      ee.emit(Events.NOTIFY_EVENT, { message });
      return { message };
    }),
  onNotification: publicProcedure.subscription(async ({ ctx: { ee } }) => {
    return observable<{ message: string }>((emit) => {
      const onNoti = ({ message }: { message: string }) => {
        emit.next({
          message,
        });
      };
      ee.on(Events.NOTIFY_EVENT, onNoti);
      return () => {
        ee.off(Events.NOTIFY_EVENT, onNoti);
      };
    });
  }),
});
```

Our `enum` type `Event` will be located in the `constants/index.ts` file and it will look as follows:

```ts
export enum Events {
  NOTIFY_EVENT = "NOTIFY_EVENT",
}
```

Then in our `app.router.ts` we will modify it to look as follows:

```ts
import { router } from "../trpc/trpc";
import { helloRouter } from "./hello.router";
import { notificationRouter } from "./notification.router";

export const appRouter = router({
  hello: helloRouter,
  notification: notificationRouter,
});

export type AppRouter = typeof appRouter;
```

Now that everything on the server is `setup` we can go ahead and change the `src/provider/TRPCProvider.ts` to look as follows:

```tsx
import React, { useState } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { trpc } from "../utils/trpc";
import superjson from "superjson";
import { createWSClient, wsLink } from "@trpc/client";
import { AppRouter } from "server";
const getEndingLink = () => {
  if (typeof window === "undefined") {
    return httpBatchLink({
      url: "http://localhost:3001/api/trpc",
    });
  }

  const client = createWSClient({
    url: "ws://localhost:3001/api/trpc",
  });

  return wsLink<AppRouter>({
    client,
  });
};
interface Props {
  children: React.ReactNode;
}
const TRPCProvider: React.FC<Props> = ({ children }) => {
  const links = [loggerLink(), getEndingLink()];
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links,
      transformer: superjson,
    })
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
};

export default TRPCProvider;
```

Now in the `App.tsx` we are going to have the following code, for `subscriptions`

```tsx
import React from "react";
import { trpc } from "./utils/trpc";

interface Props {}
const App: React.FC<Props> = () => {
  const { data, isFetched, isLoading } = trpc.hello.greeting.useQuery({
    name: " TRPC",
  });

  const { mutate } = trpc.notification.notify.useMutation();
  trpc.notification.onNotification.useSubscription(undefined, {
    onData(data) {
      console.log({ data });
    },
  });
  return (
    <div className="App">
      <pre>
        <code>{JSON.stringify({ data, isFetched, isLoading }, null, 2)}</code>
      </pre>
      <br />
      <button
        onClick={async () => {
          await mutate({
            message: "This is working",
          });
        }}
      >
        Send Notification
      </button>
    </div>
  );
};

export default App;
```

Now when you click the `Send Notification` button we will be able to see something from the `console`.

### References

1. [trpc.io](https://trpc.io/docs/react)
2. [trpc.io/docs/fastify](https://trpc.io/docs/fastify#add-some-subscriptions)
