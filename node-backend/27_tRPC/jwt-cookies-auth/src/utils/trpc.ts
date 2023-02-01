import { createTRPCReact } from "@trpc/react-query";
import { AppRouter } from "../server/routes/app.router";

export const trpc = createTRPCReact<AppRouter>();
