### backend

The backend is a standalone regular node.js express application that is running a websocket http server initialized using:

```shell
npx @crispengari/node-backend
```

The backend application is using typescript as a programming language.

### Installation of packages

The command `npx @crispengari/node-backend` comes with some packages that we need for our application such as `express` and `cors` we will need to add one package to our application which is `socket.io` and it's `types` as follows:

```shell
yarn add socket.io && yarn add -D @types/socket.io
```

### server.

The code in the file `src/server.ts` is very simple and it looks as follows:

```ts
import express from "express";
import cors from "cors";
import { createServer, Server as S } from "http";
import { Server, Socket } from "socket.io";

import { AnswerCallDataType, CallUserDataType } from "../types";
const PORT: any = 3001 || process.env.PORT;

(async () => {
  const app: express.Application = express();
  const server: S = createServer(app);
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });
  app.use(cors());
  // SOCKET CONNECTION
  io.on("connection", (socket: Socket) => {
    socket.emit("me", socket.id);

    socket.on("disconnect", () => {
      socket.broadcast.emit("ended");
    });

    socket.on(
      "call",
      ({ userToCall, signal, from, name }: CallUserDataType) => {
        io.to(userToCall).emit("call", {
          signal,
          from,
          name,
        });
      }
    );
    socket.on("answer", ({ to, signal }: AnswerCallDataType) => {
      io.to(to).emit("accepted", signal);
    });
  });
  server.listen(PORT);
})().then(() => {
  console.log(`The server is running on port: ${PORT}`);
});
```

1. Every time when we receive a connection a person will be given an id and will emit an event called `me`
2. On socket disconnection we are going to emit an event called `ended`.
3. On the `call` event that will be emmited from the client we are going to take in a lot of data:

- userToCall - the id of the user called
- signal - the signal data
- from - the id of the caller
- name - the name of the chat which is optional

4. We will then emit a `call` event to the user that we are calling and pass down the from, name and signal.
5. On the `answer` event we are going to emit the `accepted` event with the signal to the person that we are calling.

### Types.

The `AnswerCallDataType` and `CallUserDataType` are found in the `types/index.ts` file and they look as follows:

```ts
export interface AnswerCallDataType {
  signal: any;
  to: string;
}

export interface CallUserDataType {
  userToCall: string;
  from: string;
  name: string | undefined;
  signal: any;
}
```

### Refs

- [socket.io](https://socket.io/)
