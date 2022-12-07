import "dotenv/config";
import express from "express";
import cors from "cors";
import router from "./routes";
import { createYoga } from "graphql-yoga";

import { schema } from "./schema";
// ----
const app: express.Application = express();
const PORT: any = 3001 || process.env.PORT;

(async () => {
  const yoga = createYoga({
    schema,
    context: ({ request }) => ({
      myToken: request.headers.get("authorization"),
    }),
    graphiql: true,
    landingPage: false,
    cors: false,
  });
  //
  app.use(cors());
  app.use(express.json());
  app.use(router);
  app.use("/graphql", yoga);
  app.listen(PORT, () => {
    console.log(`The server is running on port: ${PORT}`);
  });
})();
