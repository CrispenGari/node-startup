### tRPC and React Native

In this repository we are going to show how we can use `trpc` together with `react-native` as a `mono-repo` project using `yarn-workspaces`.

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

After that we will need to create a folder called `packages` this is where our `trpc-node` app will live together with the client `react-native` app. Next we are going to install `concurrently` module that allows us to run the client and `trpc` server at the same time.

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

### tRPC Express Server

Next we are going to create a folder called server and create a file called `server.ts` in this folder that's where our `trpc` and `express` server will live.

Next we are going to install the packages. First you will need to navigate to the `server` folder by running the following command:

```shell
cd packages/server
```

Then after that you can now install the dependencies of the server package by running the following command:

```shell
yarn add @trpc/server cors dotenv express zod supperjson
```

Dev dependencies:

```shell
yarn add -D @types/express @types/node @types/cors ts-node-dev
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

> Also make sure that in the package.json of the server the `main` property is pointing to where your `server.ts` is located.

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
import express from "express";
import cors from "cors";
import * as trpcExpress from "@trpc/server/adapters/express";
import { createContext } from "./context/context";
export { type AppRouter } from "./routes/app.routes";
import { appRouter } from "./routes/app.routes";

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
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

So we are basically creating an `express` application that will serve a `tRPC` api at `/api/trpc`. So our `createContext` function will be coming from `src/context/context.ts` file and it will look as follows

```ts
import * as trpcExpress from "@trpc/server/adapters/express";
import { inferAsyncReturnType } from "@trpc/server";

export const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({ req, res });

export type Context = inferAsyncReturnType<typeof createContext>;
```

Now we can go ahead and create the `appRouter` in our `server/routes/app.routes.ts` and it will have the following code in it:

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

Now we have a running API we can now go to our react client and set it up.

### Setting Up React Native client

On our react-native client we need to create an expo app first by running the following command:

```shell
npx expo init mobile
```

> Make sure that you are in the `packages` folder, and you selected `typescript` as a language.

The `tsconfig.json` file on the `mobile` will look as follows:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true
  }
}
```

When it if finished we need to navigate to the `packages/mobile` and install the `server` package in our mono repo by running the following command

```
yarn add server@1.0.0
```

After installing the `server` package on the mobile package we are then going to install the packages that we will need to setup our `tRPC` on the mobile package by running the following command:

```shell
yarn add @trpc/client@next @trpc/server@next @trpc/react-query@next @tanstack/react-query
```

When we are done the we will need to create a folder in our `mobile` package called `src/utils` and create a file called `trpc.ts` and add the following code to it:

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
import { url } from "../utils";
interface Props {
  children: React.ReactNode;
}
const TRPCProvider: React.FC<Props> = ({ children }) => {
  const links = [
    loggerLink(),
    httpBatchLink({
      url,
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

So the `url` is coming from `constants/index.ts` which looks as follows:

```ts
export const url: string = `https://aae2-197-98-127-119.ngrok.io/api/trpc`;
```

I'm using `ngrok` to forward request over `http` on port `3001` which is the server port, by running the following command on `ngrok` command line that is on my computer.

```shell
ngrok http 3001
```

This will forward request on port `3001` and give me a `remote` url that will allow me to use my phone to send request on the server that is on my local computer.

```shell
Forwarding                    http://aae2-197-98-127-119.ngrok.io -> http://localhost:3001
Forwarding                    https://aae2-197-98-127-119.ngrok.io -> http://localhost:3001
```

Now in the `App.tsx` we will just wrap our `Routes` with the `TRPCProvider` as follows:

```ts
import { LogBox, View } from "react-native";
import TRPCProvider from "./src/providers/TRPCProvider";
import Routes from "./src/routes/Routes";

LogBox.ignoreLogs;
LogBox.ignoreAllLogs();
const App = () => {
  return (
    <TRPCProvider>
      <View style={{ flex: 1 }}>
        <Routes />
      </View>
    </TRPCProvider>
  );
};

export default App;
```

Now we can start making queries and mutations from the `server` with `E2E` typescript safe procedure calling. Note that if you make the changes on the server you don't need to install the `server` package again on the client.

In the `package.json` of the `mobile` you will need to point where `main` to where `App.tsx` is located in my case it is will look as follows

```json
{
  "name": "mobile",
  "version": "1.0.0",
  "main": "/App.tsx"
}
```

Now in the `App.tsx` you will need to use `registerRootComponent` function and then pass in the component `App` instead of exporting default `App` as follows.

```ts

import {registerRootComponent} from 'expo'
import { LogBox, View } from "react-native";
import TRPCProvider from "./src/providers/TRPCProvider";
import Routes from "./src/routes/Routes";

LogBox.ignoreLogs;
LogBox.ignoreAllLogs();
const App = () => {
  return (
    <TRPCProvider>
      <View style={{ flex: 1 }}>
        <Routes />
      </View>
    </TRPCProvider>
  );
};


registerRootComponent(App)
```

### Hello World

Now we can open the `Routes.tsx` and query a `hello-world` query from the `server`

```ts
import { View, Text } from "react-native";
import React from "react";
import { trpc } from "../utils/trpc";

// Your screen navigation will go here
const Routes = () => {
  const { data, isFetched, isLoading } = trpc.hello.useQuery({ name: " TRPC" });
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>{JSON.stringify({ data, isFetched, isLoading }, null, 2)}</Text>
    </View>
  );
};

export default Routes;
```

### Starting the Server

To start the server you need to navigate to the root folder and run the following command:

```shell
yarn start
```

Both the `mobile` and the `server` packages will start at the same time and on the mobile-client you will be able to see some output in the dom

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

### References

1. [trpc.io](https://trpc.io/docs/react)
2. [codevoweb.com](https://codevoweb.com/trpc-api-reactjs-nodejs-mongodb-project-setup/)
