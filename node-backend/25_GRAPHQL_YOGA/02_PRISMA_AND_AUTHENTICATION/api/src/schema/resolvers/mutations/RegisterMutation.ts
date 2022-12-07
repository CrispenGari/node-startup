import { User } from "@prisma/client";
import { hash } from "bcryptjs";
import { CtxType } from "src/types";

export const RegisterMutation = {
  Mutation: {
    register: async (
      _: any,
      {
        input: { username, email, password },
      }: { input: { username: string; email: string; password: string } },
      { prisma }: CtxType
    ) => {
      if (username.trim().length < 3) {
        return {
          error: {
            message: "the username must be at least 3 characters.",
            field: "username",
          },
        };
      }
      if (!email.includes("@")) {
        return {
          error: {
            message: "the email address must include @ sign.",
            field: "username",
          },
        };
      }
      if (password.trim().length < 3) {
        return {
          error: {
            message: "the password must be at least 3 characters.",
            field: "password",
          },
        };
      }
      try {
        const hashedPassword: string = await hash(password.trim(), 12);
        const user: User = await prisma.user.create({
          data: {
            email: email.trim(),
            username: username.trim(),
            password: hashedPassword,
          },
        });
        // console.log({ user });
        // console.log(req);
        // req.session["userId"] = user.id;
        return {
          user,
        };
      } catch (error) {
        console.log(error);
        if (error?.meta?.target === "User_email_key") {
          return {
            error: {
              message: "the email address is already taken.",
              field: "email",
            },
          };
        }

        if (error?.meta?.target === "User_username_key") {
          return {
            error: {
              message: "the username is already taken.",
              field: "username",
            },
          };
        }
        return {
          error: {
            message: "Unknown authentication error",
            field: "unknown",
          },
        };
      }
    },
  },
};
