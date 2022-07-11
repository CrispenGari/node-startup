import { NonEmptyArray } from "type-graphql";
import { HelloResolver } from "./hello/HelloResolver";
import { QuestionResolver } from "./question/QuestionResolver";
import { UserResolver } from "./user/UserResolver";

export const Resolvers: NonEmptyArray<Function> | NonEmptyArray<string> = [
  HelloResolver,
  UserResolver,
  QuestionResolver,
];
