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
