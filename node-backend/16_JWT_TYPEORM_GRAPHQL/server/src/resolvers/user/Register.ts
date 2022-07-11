import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { v4 as uuid_v4 } from "uuid";
import { hash } from "bcryptjs";
import { User } from "../../entities/User";
import {
  storeRefreshToken,
  createRefreshToken,
  createAccessToken,
} from "../../auth";
import { ContextType } from "../../types";
import { AuthUserObjectType } from "./ObjectTypes";
@Resolver()
export class RegisterResolver {
  @Mutation(() => AuthUserObjectType)
  async register(
    @Arg("email", () => String) email: string,
    @Arg("password", () => String) password: string,
    @Ctx() { res }: ContextType
  ): Promise<AuthUserObjectType> {
    const user = await User.findOne({
      where: { email: email.toLocaleLowerCase().trim() },
    });
    if (user) {
      throw new Error("email already taken");
    }
    if (password.length < 3) {
      throw new Error("the password must be at least 3 chars");
    }
    password = await hash(password, 12);
    const userId: string = uuid_v4();
    const _user = await User.create({
      email,
      password,
      userId,
    }).save();
    storeRefreshToken(res, createRefreshToken(_user));
    return {
      user: _user,
      accessToken: createAccessToken(_user),
    };
  }
}
