import express from "express";
import cors from "cors";
import router from "./routes.js";
const PORT = 3001 || process.env.PORT;
const app = express();

// Midlewares
app.use(cors());
app.use(express.json());
app.use(router);

app.listen(PORT, () => console.log(`THE SERVER IS RUNNING...`));
