import { MikroORM } from "@mikro-orm/core";
import { Todo } from "./entities/Todo";
import path from "path";
export default {
  entities: [Todo],
  migrations: {
    path: path.join(__dirname, "./migrations"),
    pattern: /^[\w-]+\d+\.[t|j]s$/,
  },
  dbName: "todo",
  password: "root",
  user: "postgres",
  port: 5432,
  debug: process.env.NODE_ENV !== "production",
  type: "postgresql",
} as Parameters<typeof MikroORM.init>[0];
// as const
