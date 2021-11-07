import express, { Response } from "express";
import { Namespace, Server, Socket } from "socket.io";
import { createServer, Server as S } from "http";
import { createClient, RedisClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

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
const pubClient: RedisClient = createClient({
  host: "localhost",
  port: 6379,
});
const subClient: RedisClient = pubClient.duplicate();
const adapter = createAdapter(pubClient, subClient);
io.adapter(adapter);
interface User {
  username: string;
  sockedId: string;
}

const chatsNameSpace: Namespace<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap
> = io.of("/chats");

chatsNameSpace.on("connection", async (socket: Socket) => {
  console.log("connected to the chat namespace: " + socket.id);
  socket.on("disconnect", () => console.log("disconnected"));
});

let users: User[] = [];

io.on("connection", async (socket: Socket) => {
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

  const sockets = await io.of("/").adapter.sockets(new Set());
  console.log(sockets); // a Set containing all the connected socket ids

  console.log(`user connected: ${socket.id}`);
  users = [...users, user];
  console.log(users);
  socket.on("send-message", () => {
    socket.broadcast.to(room).emit("new-message", {
      room,
      user,
    });
  });
  socket.on("disconnect", () => {
    console.log("disconnected");
    socket.emit("user-disconnected", {
      message: "user has disconnected.",
      user: users.find((user) => (user.sockedId = socket.id)),
    });
    users = users.filter((user) => user.sockedId !== socket.id);
  });
});
//

io.emit("all", { msg: "all users" });
server.listen(PORT, () => {
  console.log(`The server is running on port: ${PORT}`);
});
