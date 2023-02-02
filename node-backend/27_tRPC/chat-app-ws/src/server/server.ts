import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ContextType } from "./context";

const t = initTRPC.context<ContextType>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const publicProcedure = t.procedure;
export const middleware = t.middleware;
export const mergeRouters = t.mergeRouters;
export const router = t.router;