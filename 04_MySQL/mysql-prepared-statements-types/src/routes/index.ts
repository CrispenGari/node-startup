import { Router, Request, Response } from "express";
import express from "express";
import mysql from "mysql2";
import { FIND_USER } from "./queries";
import { UserI } from "src/types";

const router: express.IRouter = Router();

router.get("/", (req: Request, res: Response) => {
  return res.status(200).json({
    message: "Welcome to the MySQL server with typescript.",
  });
});

const connection: mysql.Connection = mysql.createConnection({
  port: 3306,
  user: "root",
  password: "root",
  host: "127.0.0.1" || "localhost",
});

connection.connect((error: mysql.QueryError) =>
  console.log(error ? error : "Connected to mysql server...")
);
connection.query(
  "CREATE DATABASE IF NOT EXISTS users;",
  (error: mysql.QueryError) => {
    console.log(error ? error : ".....");
  }
);
connection.query("USE users;", (error: mysql.QueryError) =>
  console.log(error ? error : "Database users selected...")
);

router.post("/login/user", (req: Request, res: Response) => {
  const { username, password } = req.body;

  connection.execute(
    FIND_USER(),
    [username, password],
    (error: mysql.QueryError, result: any) => {
      if (error) {
        throw error;
      }
      return res.status(200).json(result);
    }
  );
});

export default router;
