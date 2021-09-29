import { User } from "../../entities/User";
import { ContextType } from "src/types";
import { Ctx, Mutation, Resolver } from "type-graphql";
import { getConnection } from "typeorm";

@Resolver()
export class InvalidateTokenResolver {
  @Mutation(() => Boolean)
  async invalidateToken(@Ctx() { req }: ContextType): Promise<boolean> {
    if (!req.userId) return false;
    await getConnection().getRepository(User).increment(
      {
        userId: req.userId,
      },
      "tokenVersion",
      1
    );
    return true;
  }
}
