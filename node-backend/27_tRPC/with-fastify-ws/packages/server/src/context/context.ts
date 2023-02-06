import { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { inferAsyncReturnType } from "@trpc/server";

import EventEmitter from "events";
export const createContext = ({ req, res }: CreateFastifyContextOptions) => {
  const ee = new EventEmitter();
  return {
    req,
    res,
    ee,
  };
};

export type Context = inferAsyncReturnType<typeof createContext>;
