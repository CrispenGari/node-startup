import { User } from "../../entity/User";
import { Ctx, Query, Resolver } from "type-graphql";

import { UserContext } from "../../types";
@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async user(@Ctx() { req }: UserContext): Promise<User | undefined> {
    if (typeof req.session.userId !== "undefined") {
      const user = await User.findOne(req.session.userId);
      return user ? user : undefined;
    } else {
      return undefined;
    }
  }
}
