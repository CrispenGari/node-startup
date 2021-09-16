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

let ids: any[] = [];
io.on("connection", (socket: Socket) => {
  // console.log("we have a new connection", {
  //   query: socket.handshake.query,
  // });
  // console.log(socket.id);
  // const username = socket.handshake.query.id;

  ids.push(socket.id);
  socket.join("this");
  console.log(ids);

  ids.forEach((id) => {
    if (id !== socket.id) {
      socket.broadcast.to(id).emit("someone-joined", {
        message: `${socket.id} joined the ${"this"} chat.`,
      });
    }
  });

  // console.log(`${socket.handshake.query.id}, has joined`);
  // socket.emit("connected", {
  //   message: `hello, ${socket.handshake.query.id}`,
  //   id: socket.id,
  // });
  // socket.on("server", (_id, msg) => {
  //   console.log(_id, msg);
  // });
  socket.on("disconnect", () => {
    console.log("disconnected");
    ids = ids.filter((i) => i !== socket.id);
  });
});
//
server.listen(PORT, () => {
  console.log(`The server is running on port: ${PORT}`);
});

// io.on('connection', socket => {
//   const id = socket.handshake.query.id
//   socket.join(id)

//   socket.on('send-message', ({ recipients, text }) => {
//     recipients.forEach(recipient => {
//       const newRecipients = recipients.filter(r => r !== recipient)
//       newRecipients.push(id)
//       socket.broadcast.to(recipient).emit('receive-message', {
//         recipients: newRecipients, sender: id, text
//       })
//     })
//   })
// })
