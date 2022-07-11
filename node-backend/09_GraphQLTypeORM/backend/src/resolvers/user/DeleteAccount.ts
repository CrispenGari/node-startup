import { __cookieName__ } from "../../constants";
import { User } from "../../entity/User";
import { UserContext } from "src/types";
import { Ctx, Mutation, Resolver } from "type-graphql";

@Resolver()
export class DeleteAccountResolver {
  @Mutation(() => Boolean)
  async deleteAccount(@Ctx() { req, res }: UserContext): Promise<true | false> {
    if (typeof req.session?.userId === "undefined") {
      return false;
    }
    return new Promise(async (resolve, reject) => {
      await User.delete({ id: req.session?.userId }).then(async () => {
        await req.session?.destroy(async (err: any) => {
          res.clearCookie(__cookieName__);
          if (err) {
            return reject(false);
          } else {
            return resolve(true);
          }
        });
      });
    });
  }
}
