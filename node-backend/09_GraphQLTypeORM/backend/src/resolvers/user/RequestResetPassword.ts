import { User } from "../../entity/User";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { ResetObjectType } from "./ObjectTypes";
import { UserContext } from "../../types";

import { v4 as uuid_v4 } from "uuid";
import { __maxAge__, __reset__password__prefix } from "../../constants";
import { sendEmail } from "../../utils";
@Resolver()
export class RequestResetPasswordResolver {
  @Mutation(() => ResetObjectType)
  async requestRestPassword(
    @Arg("email", () => String) email: string,
    @Ctx() { redis }: UserContext
  ): Promise<ResetObjectType> {
    const user = await User.findOne({ where: { email } });
    if (typeof user !== "undefined") {
      const token: string = __reset__password__prefix + uuid_v4() + uuid_v4();
      const message: string = `<h1>Hello</h1><p>Please click <a href="http://localhost:300/confirm/user/${token}">here</a> to reset your password.`;
      await sendEmail(email, message, "reset password");
      await redis.setex(token, __maxAge__, user.id);
      return {
        message: "the reset link has been sent to your email",
      };
    } else {
      return {
        error: {
          message: "could not find the user with that email",
          field: "email",
        },
      };
    }
  }
}
