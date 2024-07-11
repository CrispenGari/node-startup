import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import loadEvTypes from "node-env-types";
import process from "process";
import todoRouter from "./routes/todo.routes";

if (process.env.NODE_ENV === "production") {
  console.log("Running in production mode.");
  dotenv.config({ path: ".prod.env" });
  loadEvTypes(process.cwd(), {
    filename: ".prod.env",
  });
} else {
  console.log("Running in development mode.");
  dotenv.config({ path: ".dev.env" });
  loadEvTypes(process.cwd(), {
    filename: ".dev.env",
  });
}

const { PORT } = process.env;

const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/v1/todo", todoRouter);
app.listen(PORT, () => {
  console.log("The server is running on port: %s", PORT);
});
