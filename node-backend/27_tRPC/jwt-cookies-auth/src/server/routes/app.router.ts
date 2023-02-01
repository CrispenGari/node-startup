import { router } from "../server";

import { helloRouter } from "./hello.router";
import { userRouter } from "./user.router";

export const appRouter = router({
  hello: helloRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
