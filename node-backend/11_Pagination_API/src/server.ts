import express from "express";
import cors from "cors";
import router from "./routes";
import mongoose from "mongoose";
import { connectionURL } from "./mongodb/connection";
import Post from "./mongodb/models";
import posts from "./routes/posts";
import { connection } from "./middlewares/mysql";
import { pool } from "./middlewares/postgres";

// ----
const app: express.Application = express();
const PORT: any = 3001 || process.env.PORT;
// Database connections
mongoose.connect(connectionURL, () => console.log("connected to mongodb"));
mongoose.connection.once("open", async () => {
  console.log("connection is now open");
  if ((await Post.countDocuments().exec()) > 0) return;
  // Promise.all([]);
  for (let p of posts) {
    await Post.create({
      title: p.post,
    });
  }
});
//  MySQL
(async () => {
  if ((await connection.query("SELECT * FROM posts;"))[0] as any) {
    return;
  }
  for (let p of posts) {
    const COMMAND = `INSERT INTO posts(title) values("${p.post}");`;
    await connection.query(COMMAND);
  }
  console.log("Insert Done");
})().then(() => {});

// Postgres
(async () => {
  if ((await pool.query("SELECT * FROM posts;")).rowCount > 1) {
    return;
  }
  for (let p of posts) {
    const COMMAND = `INSERT INTO posts(title) values($1) RETURNING *;`;
    await pool.query(COMMAND, [p.post]);
  }
  console.log("Insert Done");
})().then(() => {});

//
app.use(cors());
app.use(express.json());
app.use(router);
app.listen(PORT, () => {
  console.log(`The server is running on port: ${PORT}`);
});
