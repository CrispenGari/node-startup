import { NonEmptyArray } from "type-graphql";
import { LoginResolver } from "./user/Login";
import { LogoutResolver } from "./user/Logout";
import { PostResolver } from "./user/Posts";
import { RegisterResolver } from "./user/Register";
import { RevokeTokenResolver } from "./user/RevokeToken";
import { UserResolver } from "./user/User";

export const resolvers: NonEmptyArray<Function> | NonEmptyArray<string> = [
  RegisterResolver,
  UserResolver,
  LogoutResolver,
  LoginResolver,
  RevokeTokenResolver,
  PostResolver,
];
