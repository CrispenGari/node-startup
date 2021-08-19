import express from "express";
import cors from "cors";
import router from "./routes";

// ----
const app: express.Application = express();
const PORT: any = 3001 || process.env.PORT;

//
app.use(cors());
app.use(express.json());
app.use(router);

app.get("/", (_req: express.Request, res: express.Response) => {
  res.status(200).json({
    name: "backend",
    language: "typescript",
    message: "hello world!",
  });
});

app.listen(PORT, () => {
  console.log(`The server is running on port: ${PORT}`);
});
