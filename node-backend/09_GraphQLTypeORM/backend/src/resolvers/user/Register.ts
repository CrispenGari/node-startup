import { User } from "../../entity/User";
import { Arg, Mutation, Resolver, Ctx } from "type-graphql";
import { RegisterInput } from "./Inputs";
import argon2 from "argon2";
import { UserContext } from "../../types";
import { sendEmail } from "../../utils";
import { __confirm__email__prefix, __maxAge__ } from "../../constants";
import { v4 as uuid_v4 } from "uuid";
@Resolver()
export class RegisterResolver {
  @Mutation(() => User)
  async register(
    @Arg("input", () => RegisterInput, { validate: true }) input: RegisterInput,
    @Ctx() { redis }: UserContext
  ): Promise<User> {
    const token: string = __confirm__email__prefix + uuid_v4() + uuid_v4();
    const message: string = `<h1>Hello</h1><p>Please click <a href="http://localhost:300/confirm/user/${token}">here</a> to confirm your account creation.`;
    await sendEmail(input.email, message, "confirm your email");
    const hashedPassword = await argon2.hash(input.password);
    const user = await User.create({
      ...input,
      password: hashedPassword,
    }).save();
    await redis.setex(token, __maxAge__, user.id);
    return user;
  }
}
