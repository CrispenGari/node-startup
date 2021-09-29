import { NonEmptyArray } from "type-graphql";
import { InvalidateTokenResolver } from "./user/InvalidateToken";
import { LoginResolver } from "./user/Login";
import { LogoutResolver } from "./user/Logout";
import { RegisterResolver } from "./user/Register";
import { UserResolver } from "./user/User";

export const resolvers: NonEmptyArray<Function> | NonEmptyArray<string> = [
  UserResolver,
  LogoutResolver,
  LoginResolver,
  RegisterResolver,
  InvalidateTokenResolver,
];
