import { __cookieName__ } from "../../constants";
import { UserContext } from "../../types";
import { Ctx, Mutation, Resolver } from "type-graphql";
import { User } from "../../entity/User";

@Resolver()
export class LogoutResolver {
  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: UserContext): Promise<true | false> {
    await User.update(
      {
        id: req.session.userId,
      },
      {
        isLoggedIn: false,
      }
    );
    return new Promise((resolve, reject) => {
      req.session.destroy((error: any) => {
        res.clearCookie(__cookieName__);
        if (error) {
          return reject(false);
        } else {
          return resolve(true);
        }
      });
    });
  }
}
