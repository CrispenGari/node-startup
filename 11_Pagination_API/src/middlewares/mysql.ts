import { Request, Response } from "express";
import mysql from "mysql2/promise";

const port: number = 3306;
const user: string = "root";
const password: string = "root";
const host: string = "127.0.0.1" || "localhost";
export const connection = mysql.createPool({
  user: user,
  port: port,
  host: host,
  password: password,
  database: "posts",
});

/*
This is our middleware function that:
    * Takes a model
    * Get the required results
    * return the results
    * call next() -> To execute the next middleware
*/
const fetchResults = () => {
  return async (req: Request, res: Response | any, next: any) => {
    const page: number = Number.parseInt((req.query as any).page);
    const limit: number = Number.parseInt((req.query as any).limit);
    const results: any = {};
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const conn = await connection.getConnection();
    const all = await conn.query(`SELECT * FROM posts;`);
    console.log((all[0] as any).length);
    if (endIndex < (all[0] as any).length) {
      results.next = {
        page: page + 1,
        limit: limit,
      };
    }
    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit,
      };
    }
    try {
      results.results = (
        (await conn.query(
          `SELECT * FROM posts LIMIT ${startIndex}, ${startIndex};`
        )) as any
      )[0];
      res.paginatedResults = results;
      next();
    } catch (error) {
      res.status(500).json({
        code: 500,
        error,
      });
    }
  };
};

export default fetchResults;
