import { publicProcedure, router } from "../trpc/trpc";
import { z } from "zod";
export const appRouter = router({
  hello: publicProcedure
    .input(
      z.object({
        name: z
          .string()
          .min(3, { message: "minimum of 3 characters" })
          .max(100, { message: "maximum of 100 characters" }),
      })
    )
    .output(z.object({ message: z.string() }))
    .query(({ ctx, input: { name } }) => {
      return {
        message: `Hello ${name}`,
      };
    }),
});

export type AppRouter = typeof appRouter;
