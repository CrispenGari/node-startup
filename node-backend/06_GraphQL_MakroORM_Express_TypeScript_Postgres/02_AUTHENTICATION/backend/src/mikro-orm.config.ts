import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { User } from "./entities/User";
export default {
  entities: [User],
  migrations: {
    path: path.join(__dirname, "./migrations"),
    pattern: /^[\w-]+\d+\.[t|j]s$/,
    tableName: "users",
  },
  dbName: "users",
  password: "root",
  user: "postgres",
  port: 5432,
  debug: process.env.NODE_ENV !== "production",
  type: "postgresql",
} as Parameters<typeof MikroORM.init>[0];
