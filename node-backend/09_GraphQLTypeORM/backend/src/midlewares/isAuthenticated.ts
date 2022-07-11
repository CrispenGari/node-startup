import { UserContext } from "src/types";
import { MiddlewareFn } from "type-graphql";

export const isAuthenticated: MiddlewareFn<UserContext> = async (
  { context },
  next
) => {
  if (typeof context.req.session.userId === "undefined") {
    throw new Error("You are not authenticated");
  }
  return next();
};
