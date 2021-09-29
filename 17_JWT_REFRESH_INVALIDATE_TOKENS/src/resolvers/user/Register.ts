import { User } from "../../entities/User";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";

import { hash } from "argon2";
import { v4 as uuid_v4 } from "uuid";
import { ContextType } from "../../types";
import { generateAccessToken, generateRefreshToken } from "../../auth";
import {
  __cookieAccessTokenName__,
  __cookieRefreshTokenName__,
} from "../../constants";

@Resolver()
export class RegisterResolver {
  @Mutation(() => User)
  async register(
    @Arg("username", () => String) username: string,
    @Arg("password", () => String) password: string,
    @Ctx() { res }: ContextType
  ): Promise<User> {
    const user = await User.findOne({
      where: {
        username,
      },
    });
    if (user) {
      throw new Error("user already taken");
    }
    if (username.length < 3) {
      throw new Error("username must be at least 3 chars");
    }
    if (password.length < 3) {
      throw new Error("password must be at least 3 chars");
    }
    password = await hash(password);
    const userId = uuid_v4();

    const _user = await User.create({
      username,
      password,
      userId,
    }).save();
    const accessToken = generateAccessToken(_user);
    const refreshToken = generateRefreshToken(_user);
    // put them to the cookie
    res.cookie(__cookieRefreshTokenName__, refreshToken);
    res.cookie(__cookieAccessTokenName__, accessToken);
    return _user;
  }
}
