import { User } from "../../entities/User";
import { Ctx, Query, Resolver } from "type-graphql";
import { ContextType } from "../../types";

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async user(@Ctx() { req }: ContextType): Promise<User | undefined> {
    if (!req.userId) {
      return undefined;
    }
    return await User.findOne({
      where: {
        userId: req.userId,
      },
    });
  }
}
