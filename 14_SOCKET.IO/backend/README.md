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

### Emitting messages

1. sending messages to all clients

```ts
io.emit("all", { message: "hello all clients" });
```

2. sending messages to clients that belong to a certain room

```ts
io.to("room42").emit("hello", "to all clients in 'room42' room");

// or

io.sockets.in(room).emit("new-message", { msg: data.message });
```

3. sending messages to all connected users except the sender

```ts
socket.broadcast.emit("hello", "to all clients except sender");
```

4. sending messages to all users in the room except the sender

```ts
socket.broadcast.to(room).emit("new-message", {
  room,
  user,
});
```

### Creating an adapter

> An Adapter is a server-side component which is responsible for broadcasting events to all or a subset of clients. When scaling to multiple Socket.IO servers, you will need to replace the default in-memory adapter by another implementation, so the events are properly routed to all clients.

### Installation

first we need to install `socket.io/redis-adapter` and `redis` by running:

```shell
yarn add @socket.io/redis-adapter redis
# types
yarn add -D @types/redis
```

Now we can add adapters to the `io` instance as follows.

> Please make sure that the redis-server is running and ready to accept connection on port: `6379`

```ts
...
import { createClient, RedisClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";

....
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
const pubClient: RedisClient = createClient({
  host: "localhost",
  port: 6379,
});
const subClient: RedisClient = pubClient.duplicate();
const adapter = createAdapter(pubClient, subClient);
io.adapter(adapter);

```

### Getting all connection id's connected

```ts
const sockets = await io.of("/").adapter.sockets(new Set());
console.log(sockets); // a Set containing all the connected socket ids

const sockets = await io.of("/").adapter.sockets(new Set(["room1", "room2"]));
console.log(sockets); // a Set containing the socket ids in 'room1' or in 'room2'

// this method is also exposed by the Server instance
const sockets = await io.in("room3").allSockets();
console.log(sockets); // a Set containing the socket ids in 'room3'
```

### Getting all rooms in the adapter

```ts
const rooms = await io.of("/").adapter.allRooms();
console.log(rooms); // a Set containing all rooms (across every node)
```

### Creating namespaces

To create a namespace is very easy, let's say we want to create a namespace for the path `/chats` we can do it on the server as follows:

```ts
const chatsNameSpace: Namespace<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap
> = io.of("/chats");

chatsNameSpace.on("connection", async (socket: Socket) => {
  console.log("connected to the chat namespace: " + socket.id);
  socket.on("disconnect", () => console.log("disconnected"));
});
```

### References

- [Server API](https://socket.io/docs/v4/server-api/)
- [socket.io-redis-adapter](https://github.com/socketio/socket.io-redis-adapter)
