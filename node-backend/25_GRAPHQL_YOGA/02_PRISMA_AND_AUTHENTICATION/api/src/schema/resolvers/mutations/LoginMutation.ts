import { User } from "@prisma/client";
import { compare } from "bcryptjs";
import { CtxType } from "src/types";

export const LoginMutation = {
  Mutation: {
    login: async (
      _: any,
      {
        input: { username, password },
      }: { input: { username: string; password: string } },
      { prisma }: CtxType
    ) => {
      try {
        const user: User | null = await prisma.user.findFirst({
          where: {
            username,
          },
        });
        if (!!!user) {
          return {
            error: {
              message: "invalid username.",
              field: "username",
            },
          };
        }
        const correct = await compare(password, user.password);

        if (!correct) {
          return {
            error: {
              message: "Invalid password.",
              field: "password",
            },
          };
        }

        return {
          user,
        };
      } catch (error) {
        console.log(error);
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
