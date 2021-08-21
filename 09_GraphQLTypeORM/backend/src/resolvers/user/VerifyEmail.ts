import { __confirm__email__prefix, __maxAge__ } from "src/constants";
import { User } from "../../entity/User";
import { UserContext } from "../../types";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { UserObjectType } from "./ObjectTypes";

@Resolver()
export class VerifyEmailResolver {
  @Mutation(() => UserObjectType)
  async verifyEmail(
    @Arg("token", () => String) token: string,
    @Ctx() { req, redis }: UserContext
  ): Promise<UserObjectType> {
    const userId = await redis.get(token);
    if (userId === null) {
      return {
        error: {
          field: "token",
          message: "invalid token",
        },
      };
    }
    const user = await User.findOne({ where: { id: Number.parseInt(userId) } });
    if (user) {
      user.isLoggedIn = true;
      user.confirmed = true;
      await user.save();
      await redis.del(token);
      req.session.userId = Number.parseInt(userId);
      return {
        user,
      };
    } else {
      return {
        error: {
          field: "user",
          message: "failed to authenticate the user.",
        },
      };
    }
  }
}
