import path from "path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { ProtoGrpcType } from "./proto/hello";
import { HelloHandlers } from "./proto/helloPackage/Hello";
const PORT = 3001;
const PROTO_FILE = "./proto/hello.proto";

const packageDef = protoLoader.loadSync(
  path.resolve(path.join(__dirname, PROTO_FILE))
);
const grpcObject = grpc.loadPackageDefinition(
  packageDef
) as unknown as ProtoGrpcType;

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
  } as HelloHandlers);
})();
