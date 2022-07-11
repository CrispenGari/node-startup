import express from "express";
import cors from "cors";
import { createServer, Server as S } from "http";
import { Server, Socket } from "socket.io";
const PORT: any = 3001 || process.env.PORT;

interface UserType {
  username: string;
  id: string;
}
interface MeetingData {
  roomId: string;
  user: UserType;
}

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
    socket.on("create-meeting", ({ roomId, user }: MeetingData) => {
      socket.join(roomId);
      console.log(user, roomId);
      socket.to(roomId).emit("user-joined", user);
    });
    socket.on("disconnect", () => {
      socket.broadcast.emit("ended");
    });
  });
  server.listen(PORT);
})().then(() => {
  console.log(`The server is running on port: ${PORT}`);
});
