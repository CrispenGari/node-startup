import { User } from "../../entities/User";
import { ContextType } from "../../types";
import { Ctx, Query, Resolver } from "type-graphql";

import jwt from "jsonwebtoken";

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async user(@Ctx() { req }: ContextType): Promise<User | undefined> {
    const authorization = req.headers["authorization"];
    if (!authorization) return undefined;
    try {
      const token = authorization.split(" ")[0];
      const payload: any = jwt.verify(token, process.env.ACCESS_TOKEN_SECRETE!);
      return await User.findOne({
        where: {
          userId: payload.userId,
        },
      });
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }
}
