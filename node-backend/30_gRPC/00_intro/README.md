### intro

In this one we are going to learn the basic concepts of `gRPC` using `node.js`. We are going to look at the following concepts in `grpc`:

- **Unary / Simple RPC**
- **Server Streaming**
- **Client Streaming**
- **Bidirectional Streaming**

First we need to initialize the project by running the following command:

```shell
yarn init -y
```

Then we will need to install the following packages in our project.

```shell
yarn add -D typescript @grpc/grpc-js @grpc/proto-loader ts-node
```

We can then create a `tsconfig.json` by running the following command:

```shell
npx tsc --init
```

After that we are going to create a `server.ts`, `client.ts`, `proto-gen.sh` and `proto/hello.proto` files in our root directory.

### Unary Calls

Sometimes called a `simple RPC`. A simple RPC where the client sends a request to the server using the stub and waits for a response to come back, just like a normal function call.

Let's start by implementing our first `unary` call. This is where the client send the request to the server and get the response from the server. First we need to open our `proto/hello.proto` and define a service as follows:

```proto
syntax = "proto3";

package helloPackage;

service Hello {
    rpc hello(HelloRequest) returns (HelloResponse) {};
}
message HelloRequest{
    string message = 1;
}
message HelloResponse{
    string message = 1;
}
```

> You might need to install the following extensions if you are on `vscode`:

1. `Proto Lint`
2. `vscode-proto3`

Now that we have our `hello` package in the `proto/hello.proto` we can go ahead and create a command that will generate the typescript types for us in the `proto-gen.sh` file as follows:

```sh
#!/bin/bash
yarn proto-loader-gen-types --grpcLib=@grpc/grpc-js --outDir=proto/ proto/*.proto
```

So with this command we are actually generating the types from any file that we will find in the `proto` that has an extention `.proto` to the `proto` directory.

Now in the package.json we are going to define the following scripts:

```json
{
  "scripts": {
    "proto:gen": "./proto-gen.sh",
    "start": "ts-node server.ts",
    "client": "ts-node client.ts"
  }
}
```

Now to generate the types we just need to run the following command:

```shell
yarn proto:gen
```

The next thing is to create our `server.ts` code.

```ts
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
```

You can now start the server by running the following command:

```shell
yarn start
```

In the `client.ts` we are going to do pretty much the same thing.

```ts
import path from "path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { ProtoGrpcType } from "./proto/hello";
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
});
```

When the server started you can now run the the following command to start the `client` on the other terminal:

```shell
yarn client
```

We will get the following logs on the client:

```ts
{
  result: {
    message: "Hello, from gRPC!!";
  }
}
```

### Server Streaming

We have looked at unary calls, the next thing that we can have a look at is `server-side streaming`. A `server-side streaming` RPC where the client sends a request to the server and gets a stream to read a sequence of messages back. Let's first open our `hello.proto` file and add the following to it:

```proto
syntax = "proto3";

package helloPackage;

service Hello {
    rpc hello(HelloRequest) returns (HelloResponse) {};
    rpc randomNumber(NumberRequest) returns (stream NumberResponse) {};
}
message HelloRequest{
    string message = 1;
}
message HelloResponse{
    string message = 1;
}
message NumberRequest{
    int32 maxVal = 1;
}
message NumberResponse{
    int32 num = 1;
}

```

After that we need to generate types by running the following command:

```shell
yarn proto:gen
```

Then in the `server.ts` we are going to modify it to look as follows:

```ts
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
} as HelloHandlers);
```

In the client we are going to `modify` it to look as follows:

```ts
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
});
```

Now if you start the server and the client you will be able to get the following logs from the console.

```shell
{ result: { message: 'Hello, from gRPC!!' } }
{ chunk: { num: 6 } }
{ chunk: { num: 9 } }
{ chunk: { num: 3 } }
{ chunk: { num: 5 } }
{ chunk: { num: 0 } }
{ chunk: { num: 1 } }
{ chunk: { num: 5 } }
{ chunk: { num: 3 } }
{ chunk: { num: 0 } }
{ chunk: { num: 3 } }
The random number stream was closed..!
```

We have succesifuly implemented the server-side streaming in `gRPC` next we are going to have a look at the `client-based` streaming.

### Client Streaming

A `client-side streaming` RPC where the client writes a sequence of messages and sends them to the server, again using a provided stream. Once the client has finished writing the messages, it waits for the server to read them all and return its response.

So as usual let's open our `hello.proto` file and add the following in it:

```proto
syntax = "proto3";

package helloPackage;

service Hello {
    rpc hello(HelloRequest) returns (HelloResponse) {};
    rpc randomNumber(NumberRequest) returns (stream NumberResponse) {};
    rpc todos(stream TodoRequest) returns (TodoResponse) {};
}
message HelloRequest{
    string message = 1;
}
message HelloResponse{
    string message = 1;
}
message NumberRequest{
    int32 maxVal = 1;
}
message NumberResponse{
    int32 num = 1;
}
message TodoRequest{
    string title = 1;
    bool completed = 2;
}

message TodoResponse{
 repeated TodoRequest todos = 1;
}

```

Then after that we generate the types by running the following command:

```shell
yarn proto:gen
```

Then in our `server.ts` we are going to add the following code in it:

```ts
import path from "path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { ProtoGrpcType } from "./proto/hello";
import { HelloHandlers } from "./proto/helloPackage/Hello";
import { TodoResponse } from "./proto/helloPackage/TodoResponse";
import { TodoRequest } from "./proto/helloPackage/TodoRequest";
const PORT = 3001;
const PROTO_FILE = "./proto/hello.proto";

const packageDef = protoLoader.loadSync(
  path.resolve(path.join(__dirname, PROTO_FILE))
);
const grpcObject = grpc.loadPackageDefinition(
  packageDef
) as unknown as ProtoGrpcType;

const todos: Array<TodoRequest> = [];

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
  } as HelloHandlers);
})();
```

Then we will modify our `client.ts` file to have the following code in it:

```ts
import path from "path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { ProtoGrpcType } from "./proto/hello";
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
});
```

Now if we start both our client and server we should see the following on the client.

```shell
{ result: { message: 'Hello, from gRPC!!' } }
{ value: { todos: [ [Object], [Object], [Object], [Object] ] } }
{ chunk: { num: 5 } }
{ chunk: { num: 0 } }
{ chunk: { num: 0 } }
{ chunk: { num: 3 } }
{ chunk: { num: 4 } }
{ chunk: { num: 9 } }
{ chunk: { num: 8 } }
{ chunk: { num: 5 } }
{ chunk: { num: 7 } }
{ chunk: { num: 6 } }
```

### Bidirectional Streaming

A `bidirectional streaming` RPC where both sides send a sequence of messages using a read-write stream.

> In this example we are going to create a simple console chat application that allows users to communicate with each other.

So as usual let's open our `hello.proto` file and add the following in it:

```proto
syntax = "proto3";

package helloPackage;



service Hello {
    rpc hello(HelloRequest) returns (HelloResponse) {};
    rpc randomNumber(NumberRequest) returns (stream NumberResponse) {};
    rpc todos(stream TodoRequest) returns (TodoResponse) {};
    rpc chat(stream ChatRequest) returns (stream ChatResponse) {};
}
message HelloRequest{
    string message = 1;
}
message HelloResponse{
    string message = 1;
}
message NumberRequest{
    int32 maxVal = 1;
}
message NumberResponse{
    int32 num = 1;
}
message TodoRequest{
    string title = 1;
    bool completed = 2;
}

message TodoResponse{
    repeated TodoRequest todos = 1;
}

message ChatRequest {
    string message = 1;
}

message ChatResponse {
    string username = 1;
    string message = 2;
}

```

Then after that we generate the types by running the following command:

```shell
yarn proto:gen
```

Then in our `server.ts` we are going to add the following code in it:

```ts
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
```

Then we will modify our `client.ts` file to have the following code in it:

```ts
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
```

Now when starting the client you need to enter the username as follows:

```shell
yarn client <username>
```

From the first console you will be able to see the following:

```shell
hi ==> register: hi
hi ==> what?
what are you saying?
```

From the second console you will see the following:

```shell
what?
hello ==> what are you saying?
```

Now we have implemented bidirectional streaming between the server and client in `gRPC`.

### Refs

0. [node/basics](https://grpc.io/docs/languages/node/basics/)
1. [grpc-node](https://github.com/grpc/grpc-node)
2. [@grpc/proto-loader](https://www.npmjs.com/package/@grpc/proto-loader)
