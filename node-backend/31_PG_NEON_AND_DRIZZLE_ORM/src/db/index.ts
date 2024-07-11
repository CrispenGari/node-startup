import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const pool = new Pool({
  password: process.env.PGPASSWORD!,
  database: process.env.PGDATABASE!,
  host: process.env.PGHOST!,
  user: process.env.PGUSER,
  ssl: { rejectUnauthorized: false },
});

export const db = drizzle(pool);
