import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { compare } from "bcryptjs";
import { User } from "../../entities/User";
import { AuthUserObjectType } from "./ObjectTypes";
import {
  createAccessToken,
  createRefreshToken,
  storeRefreshToken,
} from "../../auth";
import { ContextType } from "../../types";
@Resolver()
export class LoginResolver {
  @Mutation(() => AuthUserObjectType)
  async login(
    @Arg("email", () => String) email: string,
    @Arg("password", () => String) password: string,
    @Ctx() { res }: ContextType
  ): Promise<AuthUserObjectType> {
    const user = await User.findOne({
      where: { email },
    });
    if (!user) {
      throw new Error("invalid email");
    }
    const valid = await compare(password, user.password);
    if (!valid) {
      throw new Error("invalid password");
    }
    storeRefreshToken(res, createRefreshToken(user));
    return {
      user,
      accessToken: createAccessToken(user),
    };
  }
}
