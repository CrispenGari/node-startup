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

### Managing users who joins

We are going to keep on tracking all the users on the server side who joins and or leave the room.

```ts
io.on("connection", (socket: Socket) => {
  const user: User = {
    username: (socket.handshake.query as any).username,
    sockedId: socket.id,
  };
  socket.broadcast.emit("user-connected", {
    message: "user has connected.",
    user,
  });
  users = [...users, user];
  socket.on("disconnect", () => {
    console.log("disconnected");
    socket.emit("user-disconnected", {
      message: "user has disconnected.",
      user: users.find((user) => (user.sockedId = socket.id)),
    });
    users = users.filter((user) => user.sockedId !== socket.id);
  });
});
```

All the users that will join the room the will be added to the users array, this can be stored in a database or somewhere. When the user disconnect we then going to pop the user from the user's array.

### Private messages broadcasting

To broadcast private messages users should join specific rooms, for this we are going to let the user on the frontend send us the room they want to join using the `handshake.query`. Then all the user in the same room will be added to that room.

```ts
io.on("connection", (socket: Socket) => {
  const user: User = {
    username: (socket.handshake.query as any).username,
    sockedId: socket.id,
  };
  socket.broadcast.emit("user-connected", {
    message: "user has connected.",
    user,
  });
  io.emit("conn", {
    message: "you are added",
  });
  const room: string = (socket.handshake.query as any).room;
  socket.join(room);
  users = [...users, user];
  socket.on("send-message", (data: { message: string; room: string }) => {
    io.sockets.in(room).emit("new-message", { msg: data.message });
  });
  socket.on("disconnect", () => {
    socket.emit("user-disconnected", {
      message: "user has disconnected.",
      user: users.find((user) => (user.sockedId = socket.id)),
    });
    users = users.filter((user) => user.sockedId !== socket.id);
  });
});
```

We will use the `io.sockets.in(room).emit()` to emit messages to a specific room.
