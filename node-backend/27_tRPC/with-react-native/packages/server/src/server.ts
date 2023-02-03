import express from "express";
import cors from "cors";
import * as trpcExpress from "@trpc/server/adapters/express";
import { createContext } from "./context/context";
export { type AppRouter } from "./routes/app.routes";
import { appRouter } from "./routes/app.routes";

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(
  "/api/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
    onError: ({ error }) => {
      if (error.code === "INTERNAL_SERVER_ERROR") {
        console.error("Something went wrong", error);
      } else {
        console.error(error);
      }
    },
  })
);

app.listen(3001, () => {
  console.log(`🚀 Server listening on port ${3001}`);
});
