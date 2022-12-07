import lodash from "lodash";
import { LoginMutation } from "./mutations/LoginMutation";
import { MessageMutation } from "./mutations/MessageMutation";
import { RegisterMutation } from "./mutations/RegisterMutation";
import { HelloQuery } from "./queries/HelloQuery";

export const resolvers = lodash.merge(
  {},
  HelloQuery,
  RegisterMutation,
  MessageMutation,
  LoginMutation
);
