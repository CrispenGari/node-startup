import "dotenv/config";
import express from "express";
import router from "./routes";
import cors from "cors";
const port: any = 3001 || process.env.PORT;

(async () => {
  const app: express.Application = express();
  app.use(cors());
  app.use(express.json());
  app.use(router);

  app.listen(port);
})().then(() => console.log("Server started at port: %s", port));
