import { add } from "./mutation/add.mutation";
import { hello } from "./query/hello.query";

export const resolvers = {
  Query: {
    hello,
  },

  Mutation: {
    add,
  },
};
