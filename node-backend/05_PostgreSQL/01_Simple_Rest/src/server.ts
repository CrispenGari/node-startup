import express from "express";
import cors from "cors";
import router from "./routes";

const app: express.Application = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);
app.use(router);

const PORT: number | any = process.env.PORT || 3001;

app.listen(PORT, () => console.log("The server has started."));
