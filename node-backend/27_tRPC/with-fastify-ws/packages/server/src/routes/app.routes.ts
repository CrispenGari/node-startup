import { router } from "../trpc/trpc";
import { helloRouter } from "./hello.router";
import { notificationRouter } from "./notification.router";

export const appRouter = router({
  hello: helloRouter,
  notification: notificationRouter,
});

export type AppRouter = typeof appRouter;
