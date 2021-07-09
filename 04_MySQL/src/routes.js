import { Router } from "express";
import http from "http";
import mysql from "mysql2";
const router = Router();

// CONNECTING TO THE SERVER

const port = 3306;
const user = "root";
const password = "root";
const host = "127.0.0.1" || localhost;

const connection = mysql.createConnection({
  user: user,
  port: port,
  host: host,
  password: password,
});
connection.connect(() => console.log("connected to MySQL local server"));

router.get("/", (req, res) => {
  res.status(200).json({
    code: 200,
    method: req.method,
    message: "OK",
    description: "MySQL express server.",
  });
});

router.get("/users", (req, res) => {});

export default router;
