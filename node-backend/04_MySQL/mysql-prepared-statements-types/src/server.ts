import express from "express";
import cors from "cors";
import router from "./routes";
const app: express.Application = express();
const PORT = 3001 || process.env.PORT;

// ----------- MIDDLEWARES
app.use(express.json());
app.use(cors());
app.use(router);

app.listen(PORT, () => console.log("Server started...."));
