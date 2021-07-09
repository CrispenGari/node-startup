import { Router } from "express";
import http from "http";
import mysql from "mysql2";
import {
  CREATE_DATABASE_IF_NOT_EXIST_QUERY,
  CREATE_TABLE_IF_NOT_EXISTS,
  SELECT_DATABASE,
} from "./queries/index.js";
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

// CREATING DATABASE
connection.query(
  CREATE_DATABASE_IF_NOT_EXIST_QUERY("students"),
  (error, result) => {
    if (error) {
      console.log(error);
      return;
    }
    if (result) {
      console.log("database created.");
      return;
    }
  }
);
// SELECTING A DATABASE AND CREATING A TABLE

connection.query(SELECT_DATABASE("students"), (error) =>
  console.log(error ? error : "database selected")
);
connection.query(CREATE_TABLE_IF_NOT_EXISTS("students"), (error, res) => {
  if (error) {
    console.log(error);
    return;
  }
  if (res) {
    console.log("table created.");
    return;
  }
});

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
