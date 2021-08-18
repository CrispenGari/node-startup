import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { User } from "../entities/User";
import { UserContext } from "../types";
import argon2 from "argon2";
import { v4 as uuid_v4 } from "uuid";
import { sendEmail } from "../utils";
import { UserInput, ResetInput } from "./inputTypes";
import { UserResponse, Email } from "./objectTypes";

const ONE_HOUR: number = 60 * 60;
@Resolver()
export class UserResolver {
  // GET USER
  @Query(() => User, { nullable: true })
  async user(@Ctx() { em, req }: UserContext): Promise<User | null> {
    if (!req.session.userId) {
      return null;
    }
    const user = await em.findOne(User, {
      id: req.session.userId,
    });
    return user;
  }
  // REGISTER
  @Mutation(() => UserResponse)
  async register(
    @Ctx() { em, req }: UserContext,
    @Arg("user", () => UserInput, { nullable: true }) user: UserInput
  ): Promise<UserResponse | null> {
    if (user.username.length <= 3) {
      return {
        error: {
          message: "username must have at least 3 characters",
          name: "username",
        },
      };
    }
    if (user.password.length <= 3) {
      return {
        error: {
          message: "password must have at least 3 characters",
          name: "password",
        },
      };
    }
    const hashed = await argon2.hash(user.password);
    const _user = em.create(User, {
      email: user.email.toLocaleLowerCase(),
      password: hashed,
      username: user.username.toLocaleLowerCase(),
    });
    try {
      await em.persistAndFlush(_user);
    } catch (error) {
      if (
        error.code === "23505" ||
        String(error.detail).includes("already exists")
      ) {
        return {
          error: {
            message: "username is taken by someone else",
            name: "username",
          },
        };
      }
    }
    req.session.userId = _user.id;
    return { user: _user };
  }

  // LOGIN
  @Mutation(() => UserResponse)
  async login(
    @Ctx() { em, req }: UserContext,
    @Arg("user", () => UserInput, { nullable: true }) user: UserInput
  ): Promise<UserResponse | null> {
    const _userFound = await em.findOne(User, {
      username: user.username.toLocaleLowerCase(),
    });
    if (!_userFound) {
      return {
        error: {
          message: "username does not exists",
          name: "username",
        },
      };
    }
    const compare = await argon2.verify(_userFound?.password, user?.password);
    if (!Boolean(compare)) {
      return {
        error: {
          name: "password",
          message: "invalid password",
        },
      };
    } else {
      req.session.userId = _userFound.id;
      return { user: _userFound };
    }
  }
  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: UserContext): Promise<boolean> {
    return new Promise((resolved, rejection) => {
      req.session.destroy((error: any) => {
        res.clearCookie("user");
        if (error) {
          return rejection(false);
        }
        return resolved(true);
      });
    });
  }
  // Sending Email
  @Mutation(() => Email)
  async sendEmail(
    @Arg("email", () => String) email: string,
    @Ctx() { redis, em }: UserContext
  ): Promise<Email> {
    // Check if the email exists in the database
    const user = await em.findOne(User, { email: email.toLocaleLowerCase() });
    if (!user) {
      return {
        error: {
          name: "email",
          message: `There's no account corresponding to ${email}.`,
        },
      };
    }
    const token: string = uuid_v4() + uuid_v4();
    await redis.setex(token, ONE_HOUR, String(user.id));
    const message: string = `Click <a href="http://localhost:3000/reset-password/${token}">here</a> to reset your password.`;
    await sendEmail(email, message);
    return {
      message: `We have sent the password reset link to ${email}. Please reset your password and login again.`,
    };
  }
  // Resetting password
  @Mutation(() => UserResponse, { nullable: true })
  async resetPassword(
    @Arg("emailInput", () => ResetInput) emailInput: ResetInput,
    @Ctx() { redis, em }: UserContext
  ): Promise<UserResponse | null | boolean> {
    // Find the token
    if (emailInput.newPassword.length <= 3) {
      return {
        error: {
          message: "password must have at least 3 characters",
          name: "password",
        },
      };
    }
    const userId = await redis.get(emailInput.token);
    if (userId === null) {
      return {
        error: {
          name: "token",
          message: "could not find the token. maybe it has expired",
        },
      };
    }
    // Update the user
    const user = await em.findOne(User, {
      id: Number.parseInt(userId),
    });
    if (user === null) {
      return {
        error: {
          name: "user",
          message: "the user was not found maybe the account was deleted",
        },
      };
    }
    if (user) {
      user.password = await argon2.hash(
        emailInput.newPassword.toLocaleLowerCase()
      );
      // delete the token
      await redis.del(emailInput.token);
      await em.persistAndFlush(user);
    }
    return {
      user: user,
    };
  }
}
