### HTTP Server

The following snippet of code create a simple http server listening on port `80`:

```js
// server.js

import http from "http";

const httpPort = 80;

const httpServer = http.createServer((req, res) => {
  console.log(req.connection.remoteAddress);
  console.log();
  console.log("<Method>", req.method, req.headers);
  console.log("<URL>", req.url);
  res.writeHead(200, "OK", { "Content-Type": "application/json" });
  res.write(
    JSON.stringify(
      {
        message: "hello world",
      },
      null,
      2
    )
  );
  res.end();
  return;
});

httpServer.listen(httpPort, "0.0.0.0", () => {
  console.log("The server is running on port: " + httpPort);
});
```

Output on the server when the request is received:

```shell
127.0.0.1

<Method> GET { host: '127.0.0.1', connection: 'close' }
<URL> /
```

### HTTP Client

Now we can go ahead and send request to the server using `http` client

```js
import http from "http";

const req = http.request(
  {
    hostname: "127.0.0.1",
    port: 80,
    path: "/",
    headers: {},
    method: "GET",
    protocol: "http:",
    origin: "*",
  },
  (res) => {
    res.setEncoding("utf8");
    res.on("data", (chuck) => console.log(chuck));
  }
);

req.on("error", (e) => console.log(e));
req.on("connect", () => console.log("Connected"));

req.end();
```

Output on the client:

```json
{
  "message": "hello world"
}
```
