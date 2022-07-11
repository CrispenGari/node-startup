import { Client, Pool } from "pg";

const pool = new Pool({
  host: "localhost" || "127.0.0.1",
  password: "root",
  user: "postgres",
  port: 5432,
  database: "movies",
});

export const client = new Client({
  host: "localhost" || "127.0.0.1",
  password: "root",
  user: "postgres",
  port: 5432,
  database: "movies",
});

client.connect();

export default pool;
