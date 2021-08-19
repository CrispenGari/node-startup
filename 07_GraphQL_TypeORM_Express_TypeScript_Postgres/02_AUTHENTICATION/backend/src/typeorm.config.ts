import path from "path";
import { createConnection } from "typeorm";
import { User } from "./entities/User";

export const typeORMConfig = {
  type: "postgres",
  username: "postgres",
  database: "users",
  password: "root",
  port: 5432,
  logging: true,
  entities: [User],
  migrations: [path.join(__dirname, "./migrations/*")],
  cli: {
    migrationsDir: "migration",
  },
} as Parameters<typeof createConnection>[0];
