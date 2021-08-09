import { Router, Request, Response, request } from "express";
import { QueryResult } from "pg";
import pool from "../db";

const router = Router();

router.all("/", (_req: Request, res: Response) => {
  return res.status(200).json({
    name: "PostgreSQL Server",
    port: 3001,
    developer: "Crispen",
  });
});

router.get("/users", async (req: Request, res: Response) => {
  if (req.method !== "GET") {
    return res.status(500).json({
      code: 500,
      message: "Only get method is allowed.",
    });
  }
  try {
    const users = await pool.query("SELECT * FROM users;");
    return res.status(200).json(users.rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      message: "Internal server Error.",
    });
  }
});

router.get("/user/:id", async (req: Request, res: Response) => {
  if (req.method !== "GET") {
    return res.status(500).json({
      code: 500,
      message: "Only get method is allowed.",
    });
  }
  try {
    const { id } = req.params;
    const user = await pool.query(
      "SELECT * FROM users WHERE uid=$1::integer;",
      [id]
    );
    return res.status(200).json(user.rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      message: "Internal server Error.",
    });
  }
});
router.delete("/user/delete/:id", async (req: Request, res: Response) => {
  if (req.method !== "DELETE") {
    return res.status(500).json({
      code: 500,
      message: "Only delete method is allowed.",
    });
  }
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM users WHERE uid=$1;", [id]);
    return res.status(200).json({
      message: "The user was deleted.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      message: "Internal server Error.",
    });
  }
});
router.post("/newuser", async (req: Request, res: Response) => {
  if (req.method !== "POST") {
    return res.status(500).json({
      code: 500,
      message: "Only post method is allowed.",
    });
  }

  try {
    const { username, firstName, lastName, age } = req.body;
    const data: QueryResult = await pool.query(
      "INSERT INTO users (username, firstName, lastName, age) VALUES($1, $2, $3, $4) RETURNING *;",
      [username, firstName, lastName, age]
    );
    return res.status(201).json(data.rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      message: "Internal server Error.",
    });
  }
});
router.put("/user/update/:id", async (req: Request, res: Response) => {
  if (req.method !== "PUT") {
    return res.status(500).json({
      code: 500,
      message: "Only put method is allowed.",
    });
  }
  try {
    const { id } = req.params;
    const _ = await pool.query("SELECT * FROM users WHERE uid=$1;", [id]);
    if (_.rowCount === 0) {
      return res.status(404).json({
        status: 404,
        message: "The user with that id was not found in the database.",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      message: "Internal server Error.",
    });
  }
  try {
    const { username, firstName, lastName, age } = req.body;
    const { id } = req.params;
    const data: QueryResult = await pool.query(
      `UPDATE users SET username = $1, firstName = $2, lastName= $3, age = $4 WHERE uid = $5 RETURNING *;`,
      [username, firstName, lastName, age, id]
    );
    return res.status(201).json(data.rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      message: "Internal server Error.",
    });
  }
});
export default router;
