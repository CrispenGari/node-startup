import path from "path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { ProtoGrpcType } from "./proto/hello";
import { HelloHandlers } from "./proto/helloPackage/Hello";
import { TodoRequest } from "./proto/helloPackage/TodoRequest";
import { ChatRequest } from "./proto/helloPackage/ChatRequest";
import { ChatResponse } from "./proto/helloPackage/ChatResponse";
const PORT = 3001;
const PROTO_FILE = "./proto/hello.proto";

const packageDef = protoLoader.loadSync(
  path.resolve(path.join(__dirname, PROTO_FILE))
);
const grpcObject = grpc.loadPackageDefinition(
  packageDef
) as unknown as ProtoGrpcType;

const todos: Array<TodoRequest> = [];
const messages = new Map<
  string,
  grpc.ServerDuplexStream<ChatRequest, ChatResponse>
>();
const hello = grpcObject.helloPackage;

(async () => {
  const server = new grpc.Server();
  await server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        console.log(error);
        return;
      }
      server.start();
      console.log("The server is running on port: " + port);
    }
  );

  server.addService(hello.Hello.service, {
    hello: async (req, res) => {
      const { message } = req.request;
      res(null, { message });
    },
    randomNumber: (call) => {
      const { maxVal = 10 } = call.request;
      let count = 0;
      const id = setInterval(() => {
        count++;
        call.write({ num: Math.floor(Math.random() * maxVal) });
        if (count >= 10) {
          clearInterval(id);
          call.end();
        }
      }, 500);
    },
    todos: (call, callback) => {
      call.on("data", (chunk: TodoRequest) => {
        console.log({ chunk });
        todos.push(chunk);
      });
      call.on("end", () => {
        callback(null, { todos });
      });
    },
    chat: (call) => {
      call.on("data", (req: ChatRequest) => {
        const msg = req.message;
        const username = call.metadata.get("username")[0] as string;
        for (let [_username, userCall] of messages) {
          if (username !== _username) {
            userCall.write({
              username: username,
              message: msg,
            });
          }
        }

        if (typeof messages.get(username) === "undefined") {
          messages.set(username, call);
        }
      });
      call.on("end", (req: ChatRequest) => {
        const username = call.metadata.get("username")[0] as string;
        messages.delete(username);
        for (let [user, userCall] of messages) {
          userCall.write({
            username: username,
            message: "left the chat",
          });
        }
        console.log(`${username} left chat session`);
        call.write({
          username: "server",
          message: `Bye ${username}`,
        });
        call.end();
      });
    },
  } as HelloHandlers);
})();
