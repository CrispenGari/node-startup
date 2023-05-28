### GRPC with React

In this one we are going to learn how to link the `gRPC` server with a react client. We are going to use `envoy` image with `docker` to make this process work. So our server code will live in the `server` folder and the client code will live in the `client` folder.

### Setting up `envoy` and `docker`

First we will need to setup the [`envoy`](https://hub.docker.com/r/envoyproxy/envoy-dev) and `docker` for that we will need a `docker-compose.yml` file in our `./docker` folder and add the following to it:

```yml
version: "3"
services:
  envoy:
    image: envoyproxy/envoy:dev-3f0b409ec062baec62d650d86333250d0b893df7
    volumes:
      - ./envoy.yaml:/etc/envoy/envoy.yaml
    ports:
      - "9901:9901"
      - "3001:3001"
```

You can read more about running `envoy` [here](https://www.envoyproxy.io/docs/envoy/latest/start/docker#running-envoy-with-docker-compose)

Then next we are going to create an `envoy.yaml` in our docker folder so that it will look as follows:

```yml
admin:
  access_log_path: /tmp/admin_access.log
  address:
    socket_address: { address: 0.0.0.0, port_value: 9901 }

static_resources:
  listeners:
    - name: listener_0
      address:
        socket_address: { address: 0.0.0.0, port_value: 3001 }
      filter_chains:
        - filters:
            - name: envoy.filters.network.http_connection_manager
              typed_config:
                "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
                codec_type: auto
                stat_prefix: ingress_http
                route_config:
                  name: local_route
                  virtual_hosts:
                    - name: local_service
                      domains: ["*"]
                      routes:
                        - match: { prefix: "/" }
                          route:
                            cluster: hello_service
                            timeout: 0s
                            max_stream_duration:
                              grpc_timeout_header_max: 0s
                      cors:
                        allow_origin_string_match:
                          - prefix: "*"
                        allow_methods: GET, PUT, DELETE, POST, OPTIONS
                        allow_headers: keep-alive,user-agent,cache-control,content-type,content-transfer-encoding,custom-header-1,x-accept-content-transfer-encoding,x-accept-response-streaming,x-user-agent,x-grpc-web,grpc-timeout
                        max_age: "1728000"
                        expose_headers: custom-header-1,grpc-status,grpc-message
                http_filters:
                  - name: envoy.filters.http.grpc_web
                    typed_config:
                      "@type": type.googleapis.com/envoy.extensions.filters.http.grpc_web.v3.GrpcWeb
                  - name: envoy.filters.http.cors
                    typed_config:
                      "@type": type.googleapis.com/envoy.extensions.filters.http.cors.v3.Cors
                  - name: envoy.filters.http.router
                    typed_config:
                      "@type": type.googleapis.com/envoy.extensions.filters.http.router.v3.Router
  clusters:
    - name: hello_service
      connect_timeout: 0.25s
      type: logical_dns
      http2_protocol_options: {}
      lb_policy: round_robin
      load_assignment:
        cluster_name: echo_service
        endpoints:
          - lb_endpoints:
              - endpoint:
                  address:
                    socket_address:
                      address: host.docker.internal
                      port_value: 3001
```

We need to specify our port to `3001` which is the port that is pointing to our `gRPC` server in the `envoy.yaml` file:

```yml
socket_address: { address: 0.0.0.0, port_value: 3001 }
```

> Note that these ports we are also binding this port in the `docker-compose` file. Once we have this we can start our `docker-images` by navigating to the docker folder and run:

```shell
docker compose up
```

Once we are done we can now start writing code on the server. We will follow the steps that we used [here](https://github.com/CrispenGari/node-startup/tree/main/node-backend/30_gRPC/00_intro).

We are going to create a `server.ts`, `proto-gen.sh` and `proto/hello.proto` files in our root directory.

In our `proto-gen.sh` we are going to have the following:

```sh
#!/bin/bash
yarn proto-loader-gen-types --grpcLib=@grpc/grpc-js --outDir=proto/ proto/*.proto

```

In our `proto/hello.proto` we are going to have the following:

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

We will modify our scripts in the `server/package.json` and add the following:

```ts
{
  "scripts": {
    "proto:gen": "./proto-gen.sh",
    "start": "ts-node server.ts",
  }
}
```

Now we can run the following command to generate types for our `package`

```shell
yarn proto:gen
```

In our `server.ts` we are going to have the following:

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

Now that our server is ready we can start it by running the following command:

```shell
yarn start
```

### Client

Now it's time for us to consume our `server` api on the client with react. Navigate to the client and install the following packages:

```shell
yarn add google-protobuf grpc-web

# i you don't have
npm install -g protoc-gen-js protoc-gen-grpc-web
```

We will then create a file called `proto-gen.sh` in the client folder and add the following command to it:

```sh
mkdir -p ./src/proto
protoc --proto_path=../server/proto ../server/proto/*.proto  --js_out=import_style=commonjs:./src/proto --grpc-web_out=import_style=typescript,mode=grpcwebtext:./src/proto

```

In the `package.json` of the client we will then need to add the following `scripts`:

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "proto:gen": "./proto-gen.sh"
  }
}
```

Now we can generate the types on the client by running the following command:

```shell
yarn  proto:gen
```

> Before you run the above command makesure that you have `protoc` which you can download on windows by opening `PowerShell` and and administrator and run the following command:

```shell
choco install protoc
```

Now we can go ahead and make our unary call from the server using our `react-app`. In the `App.tsx` we are going to have the following:

```ts
import React from "react";
import { client } from "./grpc";
import { HelloRequest } from "./proto/hello_pb";

interface Props {}
const App: React.FC<Props> = () => {
  const [message, setMessage] = React.useState("");
  const [data, setData] = React.useState<any>();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const helloReq = new HelloRequest();
    helloReq.setMessage(message);
    const res = await client.hello(helloReq, {});
    setData(res.toObject());
  };
  return (
    <div className="App">
      <pre>
        <code>{JSON.stringify({ data }, null, 2)}</code>
      </pre>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="message..."
          onChange={(e) => setMessage(e.target.value)}
          value={message}
        />
        <button type="submit">SEND</button>
      </form>
    </div>
  );
};
export default App;
```

The above code will test our `Unary` call hello from the server and returns a response. In the `grpc/index.ts` we are going to have the following code for our `client`:

```ts
import { HelloClient } from "../proto/HelloServiceClientPb";
export const client = new HelloClient("http://localhost:3001");
```

### Refs

0. [node/basics](https://grpc.io/docs/languages/node/basics/)
1. [grpc-node](https://github.com/grpc/grpc-node)
2. [@grpc/proto-loader](https://www.npmjs.com/package/@grpc/proto-loader)
3. [www.envoyproxy.io](https://www.envoyproxy.io/docs/envoy/latest/start/docker#running-envoy-with-docker-compose)
4. [00_INTRO](https://github.com/CrispenGari/node-startup/tree/main/node-backend/30_gRPC/00_intro)
5. [grpc-web](https://github.com/grpc/grpc-web)
6. [google-protobuf](https://www.npmjs.com/package/google-protobuf)
