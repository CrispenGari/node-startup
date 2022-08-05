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
