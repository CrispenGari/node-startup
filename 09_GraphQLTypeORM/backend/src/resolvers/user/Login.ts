import { User } from "../../entity/User";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { LoginInput } from "./Inputs";
import { UserObjectType } from "./ObjectTypes";
import agron2 from "argon2";
import { UserContext } from "src/types";

@Resolver()
export class LoginResolver {
  @Mutation(() => UserObjectType, { nullable: true })
  async login(
    @Arg("input", () => LoginInput) { usernameOrEmail, password }: LoginInput,
    @Ctx() { req }: UserContext
  ): Promise<UserObjectType | undefined | null> {
    const thisIsEmail: boolean = isEmail(usernameOrEmail);
    let user;
    if (thisIsEmail) {
      user = await User.findOne({
        where: {
          email: usernameOrEmail,
        },
      });
    } else {
      user = await User.findOne({
        where: {
          username: usernameOrEmail,
        },
      });
    }
    if (user) {
      const correct: boolean = await agron2.verify(user.password, password);
      if (correct) {
        req.session.userId = user.id;
        user.isLoggedIn = true;
        return {
          user: await user.save(),
        };
      } else {
        return {
          error: {
            message: `incorrect password.`,
            field: `password`,
          },
        };
      }
    } else {
      return {
        error: {
          message: `the ${thisIsEmail ? "email" : "username"} does not exists.`,
          field: `${thisIsEmail ? "email" : "username"}`,
        },
      };
    }
  }
}

const isEmail = (email: string): boolean =>
  /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
    email
  );
