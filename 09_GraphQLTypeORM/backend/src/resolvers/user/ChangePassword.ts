import { UserContext } from "../../types";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { ResetObjectType } from "./ObjectTypes";
import { User } from "../../entity/User";
import argon2 from "argon2";

@Resolver()
export class ChangePasswordResolver {
  @Mutation(() => ResetObjectType)
  async resetPassword(
    @Ctx() { redis }: UserContext,
    @Arg("token", () => String) token: string,
    @Arg("password", () => String) password: string
  ): Promise<ResetObjectType> {
    const userId = await redis.get(token);
    if (userId === null) {
      return {
        error: {
          message: "could not find the token maybe it has expired.",
          field: "token",
        },
      };
    } else {
      await redis.del(token);
      const user = await User.findOne({ where: { id: parseInt(userId, 10) } });
      if (typeof user === "undefined") {
        return {
          error: {
            message: "the user could not be found.",
            field: "token",
          },
        };
      } else {
        user.password = await argon2.hash(password);
        await user.save();
        return {
          message: "your password was reset please login again.",
        };
      }
    }
  }
}
