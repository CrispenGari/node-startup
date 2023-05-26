import path from "path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { ProtoGrpcType } from "./proto/hello";
import readline from "readline";

const PORT = 3001;
const PROTO_FILE = "./proto/hello.proto";

const packageDef = protoLoader.loadSync(
  path.resolve(path.join(__dirname, PROTO_FILE))
);
const grpcObject = grpc.loadPackageDefinition(
  packageDef
) as unknown as ProtoGrpcType;

const client = new grpcObject.helloPackage.Hello(
  `0.0.0.0:${PORT}`,
  grpc.credentials.createInsecure()
);

const deadline = new Date();
deadline.setSeconds(deadline.getSeconds() + 5);

client.waitForReady(deadline, async (err) => {
  if (err) {
    console.error(err);
    return;
  }
  client.hello({ message: "Hello, from gRPC!!" }, (error, result) => {
    if (error) {
      console.log(error);
      return;
    }
    console.log({ result });
  });

  const randomNumberStream = client.randomNumber({ maxVal: 10 });
  randomNumberStream.on("data", (chunk) => {
    console.log({ chunk });
  });
  randomNumberStream.on("end", () =>
    console.log("The random number stream was closed..!")
  );

  const todoStream = client.todos((err, value) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log({ value });
  });
  todoStream.write({ title: "coding", completed: false });
  todoStream.write({ title: "trpc", completed: false });
  todoStream.write({ title: "grpc", completed: false });
  todoStream.write({ title: "deno", completed: true });
  todoStream.end();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const username = process.argv[2];
  if (!username)
    console.error("Username is required to join the chat"), process.exit();

  const metadata = new grpc.Metadata();
  metadata.set("username", username);
  const call = client.chat(metadata);

  call.write({
    message: "register: " + username,
  });

  call.on("data", (chunk) => {
    console.log(`${chunk.username} ==> ${chunk.message}`);
  });

  rl.on("line", (line) => {
    if (line === "q") {
      call.end();
    } else {
      call.write({
        message: line,
      });
    }
  });
});
