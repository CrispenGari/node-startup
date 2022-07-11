import path from "path";
import { createConnection } from "typeorm";
import { AuthUser } from "./entities/AuthUser";

export const typeORMConfig = {
  type: "postgres",
  username: "postgres",
  database: "auth_user",
  password: "root",
  port: 5432,
  logging: true,
  entities: [AuthUser],
  migrations: [path.join(__dirname, "./migrations/*")],
  cli: {
    migrationsDir: "migration",
  },
} as Parameters<typeof createConnection>[0];
