### Socket.io with Express

We are going to have a closer look on how we can integrate `socket.io` with a react application.

### Installation

```shell
yarn add socket.io
```

### Creating a basic server that will listen for new connections.

```ts
import express, { Response } from "express";
import { Server, Socket } from "socket.io";
import { createServer, Server as S } from "http";
// import router from "./routes";

// ----
const app: express.Application = express();
// app.use(router);

app.get("/", (_req: any, res: Response) =>
  res.status(200).sendFile(__dirname + "/index.html")
);
const PORT: any = 3001 || process.env.PORT;
const server: S = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket: Socket) => {
  console.log("we have a new connection", {
    query: socket.handshake.query,
  });
  console.log(socket.id);
});
//
server.listen(PORT, () => {
  console.log(`The server is running on port: ${PORT}`);
});
```

**Note:** `socket.handshake.query` allows us to receive queries from the frontend application. Also we have configured `cors` so that any app that is running on different port with the server will be able to communicate with our backend.
