import path from "path";
import { createConnection } from "typeorm";
import { Todo } from "./entities/Todo";

export const typeORMConfig = {
  type: "postgres",
  username: "postgres",
  database: "todo",
  password: "root",
  port: 5432,
  logging: true,
  entities: [Todo],
  migrations: [path.join(__dirname, "./migrations/*")],
  migrationsTableName: "todos",
  cli: {
    migrationsDir: "migration",
  },
} as Parameters<typeof createConnection>[0];
