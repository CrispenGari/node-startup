import { router } from "../server";

import { helloRouter } from "./hello.router";

export const appRouter = router({
  hello: helloRouter,
});

export type AppRouter = typeof appRouter;
