import { ContextType } from "../../types";
import { Ctx, Mutation, Resolver } from "type-graphql";

import { storeRefreshToken } from "../../auth";
@Resolver()
export class LogoutResolver {
  @Mutation(() => Boolean)
  async logout(@Ctx() { res }: ContextType): Promise<Boolean> {
    storeRefreshToken(res, "");
    // you can clear the cookie if you want by calling
    //  res.clearCookie(__cookieName__)
    return true;
  }
}
