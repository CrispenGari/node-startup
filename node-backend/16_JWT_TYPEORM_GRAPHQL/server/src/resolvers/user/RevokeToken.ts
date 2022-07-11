import { User } from "../../entities/User";
import { Arg, Mutation, Resolver } from "type-graphql";
import { getConnection } from "typeorm";

/*
To revoke the token we are just going to 
change the version number of the token

*/
@Resolver()
export class RevokeTokenResolver {
  @Mutation(() => Boolean)
  async revokeRefreshTokensForUser(
    @Arg("userId", () => String) userId: string
  ): Promise<Boolean> {
    await getConnection()
      .getRepository(User)
      .increment({ userId: userId }, "tokenVersion", 1);
    return true;
  }
}
