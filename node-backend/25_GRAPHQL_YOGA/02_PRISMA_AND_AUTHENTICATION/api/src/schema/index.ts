import { makeExecutableSchema } from "graphql-tools";
import { inputTypes } from "./typeDefs/inputs";
import { objectTypes } from "./typeDefs/object";
import { Query } from "./typeDefs/query";
import { Mutation } from "./typeDefs/mutation";
import { resolvers } from "./resolvers";
export const schema = makeExecutableSchema({
  typeDefs: [inputTypes, objectTypes, Query, Mutation],
  resolvers,
});
