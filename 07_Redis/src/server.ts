import express from "express";
import cors from "cors";

// ----
const app: express.Application = express();
const PORT: any = 3001 || process.env.PORT;

//
app.use(cors());

// Routes
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
