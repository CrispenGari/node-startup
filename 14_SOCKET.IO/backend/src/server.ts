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

interface User {
  username: string;
  sockedId: string;
}
let users: User[] = [];
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
  console.log(`user connected: ${socket.id}`);
  users = [...users, user];
  console.log(users);
  socket.on("send-message", (data: { message: string; room: string }) => {
    io.sockets.in(room).emit("new-message", { msg: data.message });
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
server.listen(PORT, () => {
  console.log(`The server is running on port: ${PORT}`);
});
