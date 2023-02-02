import { router } from "../server";
import { postRoutes } from "./post.router";
export const appRouter = router({
  post: postRoutes,
});

export type AppRouter = typeof appRouter;
