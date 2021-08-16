import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { User } from "../entities/User";
import { UserContext } from "../types";
import argon2 from "argon2";

@InputType()
class UserInput {
  @Field(() => String)
  username!: string;

  @Field(() => String, { nullable: true })
  email!: string;

  @Field(() => String)
  password!: string;
}

@ObjectType()
class Error {
  @Field(() => String)
  name: string;

  @Field(() => String)
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => Error, { nullable: true })
  error?: Error;
}

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
}
