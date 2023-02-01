import { z } from "zod";
import { publicProcedure, router } from "../server";

export const helloRouter = router({
  greeting: publicProcedure
    .input(
      z.object({
        name: z
          .string()
          .min(3, { message: "minimum of 3 characters" })
          .max(10, { message: "maximum of 10 characters" }),
      })
    )
    .output(z.object({ message: z.string() }))
    .query(({ ctx, input: { name } }) => {
      return {
        message: `Hello ${name}`,
      };
    }),
  fromTRPC: publicProcedure.query(({ ctx }) => "Hello from TRPC"),
});
