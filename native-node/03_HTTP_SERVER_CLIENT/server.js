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
