### tRPC Chat App

In this one we are going to walk through on how to create a simple chat app using `websockects`, `trpc-subscriptions` and `next-auth`.

### Getting started

We are going to follow the setup from [this repository](https://github.com/CrispenGari/node-startup/tree/main/node-backend/27_tRPC/jwt-cookies-auth). We will need to install the following packages that we are going to use.

```shell
yarn add @trpc/client @trpc/server @tanstack/react-query @trpc/react @trpc/next zod react-query superjson jotai @prisma/client react-hook-form jsonwebtoken cookie @trpc/react-query ws nanoid node-fetch@2.6.1
```

Installing `@types`

```shell
yarn add -D @types/jsonwebtoken @types/cookie @types/ws npm-run-all @types/cookie @types/node-fetch@2.5.11 ts-node-dev dotenv
```

### server

First we need to create our `trpc` server. So we will open the `src/server/server.ts` and add the following code.

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

In out `src/server/context.ts` file we are going to create an `instance` of an `EventEmiter` this allows us to broadcast events on the `ws` chanel so our `src/server/context.ts` will look as follows

```ts
import EventEmitter from "events";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../utils/prisma";

const ee = new EventEmitter();
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
    ee,
    // prisma,
  };
};

export type ContextType = ReturnType<typeof createContext>;
```

The next thing is to create a `ws` server. So we are going to create a file inside the `src/server` called `wsServer` which will contain the following code in it:

```ts
import ws from "ws";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import { appRouter } from "./routes/app.router";
import { createContext } from "./context";

const wss = new ws.Server({
  port: 3001,
});

const handler = applyWSSHandler({
  wss,
  router: appRouter,
  createContext: createContext as any,
});

wss.on("connection", () => {
  console.log(`Got a connection ${wss.clients.size}`);
  wss.once("close", () => {
    console.log(`Closed connection ${wss.clients.size}`);
  });
});

console.log(`wss server start at ws://localhost:3001`);

process.on("SIGTERM", () => {
  console.log("Got SIGTERM");
  handler.broadcastReconnectNotification();
  wss.close();
});
```

> Note that our `ws` server and the `next-js` server will run in parallell so we will need to use a package called [npm-run-all](https://www.npmjs.com/package/npm-run-all) and modify our `package.json` scripts to look as follows:

```json
{
  "scripts": {
    "dev:ws": "ts-node-dev --project tsconfig.server.json --respawn --transpile-only src/server/wsServer.ts",
    "dev:next": "next dev",
    "dev": "run-p dev:*",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

Now when we are starting the server we are going to run the `dev` command as usual for example:

```shell
yarn dev
```

Now that we are having our `ws` server we can go ahead and define our `routes` and `procedure` calls. In the `app.router.ts` we are going to have the following in it:

```ts
import { router } from "../server";
import { helloRouter } from "./hello.router";
import { roomRouter } from "./room.router";
export const appRouter = router({
  hello: helloRouter,
  room: roomRouter,
});

export type AppRouter = typeof appRouter;
```

Our `room.router.ts` will have the logic of sending messages and `emitting`
events using the `EventEmitter` instance that is in our `context`. These events will be defined as `enum`s in the `src/constants/index.ts` file and it looks as follows

```ts
// src/constants/index.ts
export const baseUrl: string = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : "http://localhost:3000";

export const url: string = `${baseUrl}/api/trpc`;

export enum Events {
  SEND_MESSAGE = "SEND_MESSAGE",
}
```

The `room.router.ts` file just contain a mutation and a subscription that listen to a `SEND_MESSAGE` event.

```ts
// room.router.ts
import { publicProcedure, router } from "../server";
import { randomUUID } from "crypto";
import { observable } from "@trpc/server/observable";
import { Message, messageSubSchema, sendMessageSchema } from "../schema";
import { Events } from "../../constants";

export const roomRouter = router({
  sendMessage: publicProcedure
    .input(sendMessageSchema)
    .mutation(async ({ ctx: { ee }, input: { message, roomId, sender } }) => {
      const msg: Message = {
        id: randomUUID(),
        message,
        roomId,
        sender,
        sentAt: new Date(),
      };

      ee.emit(Events.SEND_MESSAGE, msg);
      return msg;
    }),
  onSendMessage: publicProcedure
    .input(messageSubSchema)
    .subscription(async ({ input: { roomId }, ctx: { ee } }) => {
      return observable<Message>((emit) => {
        const onMessage = (msg: Message) => {
          if (roomId === msg.roomId) {
            emit.next(msg);
          }
        };
        ee.on(Events.SEND_MESSAGE, onMessage);

        return () => {
          ee.off(Events.SEND_MESSAGE, onMessage);
        };
      });
    }),
});
```

We will need to change our `pages/_app.tsx` file to look as follows

```ts
import { AppRouter } from "@/server/routes/app.router";
import "@/styles/globals.css";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { withTRPC } from "@trpc/next";
import superjson from "superjson";
import type { AppProps } from "next/app";
import { url } from "@/constants";
import { createWSClient, wsLink } from "@trpc/client";

const getEndingLink = () => {
  if (typeof window === "undefined") {
    return httpBatchLink({
      url,
    });
  }

  const client = createWSClient({
    url: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001",
  });

  return wsLink<AppRouter>({
    client,
  });
};
const App = ({ Component, pageProps }: AppProps) => {
  return <Component {...pageProps} />;
};

export default withTRPC<AppRouter>({
  config({ ctx }) {
    const links = [loggerLink(), getEndingLink()];
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

Now Users can join rooms. To join the room the user will give us their `name` and the `roomId` in the `home` page. Then we will redirect them to the room they want to send messages. The logic for doing that will be found in the `pages/index.tsx` which contains the following code.

```ts
import { useRouter } from "next/router";
import React, { useState } from "react";
interface Props {}
const Home: React.FC<Props> = ({}) => {
  const [roomId, setRoomId] = useState("");
  const [name, setName] = useState("");
  const router = useRouter();

  const joinRoom = () => {
    router.replace(`/room/${roomId}?name=${name}`);
  };
  return (
    <div className="index">
      <input
        type="text"
        placeholder="roomId"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />
      <br />
      <input
        type="text"
        placeholder="John"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <br />
      <button onClick={joinRoom}>JOIN ROOM</button>
    </div>
  );
};
export default Home;
```

In the `pages/room/[roomId].tsx` file we will have the following

```ts
import { Message } from "@/server/schema";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import React, { useState } from "react";

interface Props {}
const Room: React.FC<Props> = ({}) => {
  const router = useRouter();

  const { mutate, isLoading } = trpc.room.sendMessage.useMutation();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const sendMessage = async (e: any) => {
    e.preventDefault();
    if (message.trim().length === 0) return;
    await mutate({
      message,
      roomId: router.query.roomId as string,
      sender: router.query.name as string,
    });
  };
  trpc.room.onSendMessage.useSubscription(
    { roomId: router.query.roomId as string },
    {
      onData(data) {
        setMessages((m) => [...m, data]);
      },
    }
  );
  return (
    <div className="[roomId]">
      <h1>Room {router.query.roomId}</h1>
      <br />
      <br />
      <ul>
        {messages.map((message) => (
          <li key={message.id}>{message.message}</li>
        ))}
      </ul>

      <br />
      <br />

      <form onSubmit={sendMessage}>
        <input
          type="text"
          placeholder="What do you want to say"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit" disabled={isLoading}>
          SEND
        </button>
      </form>
    </div>
  );
};

export default Room;
```

> So basically we will be listen to new messages that will be coming in for this room using the `trpc.room.onSendMessage.useSubscription()` and then append the new message in the messages list that exists.

In the `pages/api/trpc/[trpc].ts` we will have the following code in it.

```ts
import { createContext } from "@/server/context";
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

The instance of `trpc` is coming from `src/constants/trpc.ts` and have the following code in it.

```ts
import { createTRPCReact } from "@trpc/react-query";
import { AppRouter } from "../server/routes/app.router";

export const trpc = createTRPCReact<AppRouter>();
```

### Refs

1. [create.t3.gg](https://create.t3.gg/)
2. [npm-run-all](https://www.npmjs.com/package/npm-run-all)
