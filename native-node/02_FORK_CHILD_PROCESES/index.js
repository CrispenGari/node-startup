const express = require("express");
const { fork } = require("child_process");

const app = express();

app.get("/hello", (req, res) => {
  return res.status(200).json({
    path: "/hello",
    message: "hello world",
  });
});

app.get("/isprime/:number", (req, res) => {
  const child = fork("child.js", {});
  child.send({ number: req.params.number });
  child.on("message", (m) => {
    return res.status(200).json(m);
  });
});

app.listen(3001, () => console.log("The server has started at port: 3000"));
