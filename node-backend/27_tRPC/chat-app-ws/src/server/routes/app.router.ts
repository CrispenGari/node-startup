import { router } from "../server";
import { helloRouter } from "./hello.router";
import { roomRouter } from "./room.router";
export const appRouter = router({
  hello: helloRouter,
  room: roomRouter,
});

export type AppRouter = typeof appRouter;
