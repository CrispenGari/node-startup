import { Pool } from "pg";
import { Request, Response } from "express";
export const pool = new Pool({
  host: "localhost" || "127.0.0.1",
  password: "root",
  user: "postgres",
  port: 5432,
  database: "posts",
});

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
