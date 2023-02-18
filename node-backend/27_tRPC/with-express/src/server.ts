import express from "express";
import cors from "cors";
import * as trpcExpress from "@trpc/server/adapters/express";
import { createContext } from "./context/context";
export { type AppRouter } from "./routes/app.routes";
import { appRouter } from "./routes/app.routes";
import { expressHandler } from "trpc-playground/handlers/express";

(async () => {
  const trpcApiEndpoint = "/api/trpc";
  const playgroundEndpoint = "/api/trpc-playground";
  const app = express();
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );
  app.use(
    trpcApiEndpoint,
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
  app.use(
    playgroundEndpoint,
    await expressHandler({
      trpcApiEndpoint,
      playgroundEndpoint,
      router: appRouter,
      request: {
        superjson: true,
      },
    })
  );
  app.listen(3001, () => {});
})().then(() => {
  console.log(`🚀 Server listening on port ${3001}`);
});
