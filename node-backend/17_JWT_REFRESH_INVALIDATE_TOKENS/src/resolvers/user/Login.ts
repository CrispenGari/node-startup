import { User } from "../../entities/User";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";

import { verify } from "argon2";
import { ContextType } from "../../types";
import { generateAccessToken, generateRefreshToken } from "../../auth";
import {
  __cookieAccessTokenName__,
  __cookieRefreshTokenName__,
} from "../../constants";

@Resolver()
export class LoginResolver {
  @Mutation(() => User)
  async login(
    @Arg("username", () => String) username: string,
    @Arg("password", () => String) password: string,
    @Ctx() { res }: ContextType
  ): Promise<User> {
    const user = await User.findOne({
      where: {
        username,
      },
    });
    if (!user) {
      throw new Error("no user");
    }
    const valid = await verify(user.password, password);
    if (!valid) throw new Error("invalid password");
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    // put them to the cookie
    res.cookie(__cookieRefreshTokenName__, refreshToken);
    res.cookie(__cookieAccessTokenName__, accessToken);
    return user;
  }
}
