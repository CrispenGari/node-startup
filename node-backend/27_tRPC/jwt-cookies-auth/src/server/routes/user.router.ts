import { publicProcedure, router } from "../server";
import {
  confirmSchema,
  loginSchema,
  registerSchema,
} from "../schema/user.schema";
import * as trpc from "@trpc/server";
import argon2 from "argon2";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { sendMail } from "@/utils/mailer";
import { decode } from "@/utils/base64";
import { signJwt, verifyJwt } from "@/utils/jwt";
import { serialize } from "cookie";

export const userRouter = router({
  me: publicProcedure.query(async ({ ctx: { prisma, req } }) => {
    const token = req.cookies.jwt;
    if (!!!token) return null;
    try {
      const verified = verifyJwt(token);
      return await prisma.user.findFirst({ where: { id: verified.id } });
    } catch (e) {
      return null;
    }
  }),
  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ ctx: { prisma, res }, input: { email, password } }) => {
      const user = await prisma.user.findFirst({
        where: {
          email: email.trim().toLowerCase(),
        },
      });

      if (!!!user)
        throw new trpc.TRPCError({
          code: "FORBIDDEN",
          message: "Invalid email address",
        });

      const valid = await argon2.verify(user.password, password.trim());
      if (!valid)
        throw new trpc.TRPCError({
          code: "FORBIDDEN",
          message: "Invalid password",
        });

      const jwt = signJwt(user);
      res.setHeader("Set-Cookie", serialize("jwt", jwt, { path: "/" }));
      return {
        user,
      };
    }),
  register: publicProcedure
    .input(registerSchema)
    .mutation(
      async ({ ctx: { prisma }, input: { email, username, password } }) => {
        try {
          const hashedPassword = await argon2.hash(password.trim());
          const random = Math.random().toString().slice(2, 8);
          const user = await prisma.user.create({
            data: {
              email: email.trim().toLowerCase(),
              password: hashedPassword,
              username: username.trim().toLowerCase(),
              avatar: `https://avatars.dicebear.com/api/human/${random}.svg`,
            },
          });
          const code = Math.random().toString().slice(2, 7);
          const html = `<h1>Verify your email ${user.email}</h1> <p><b>Code: ${code}</b></p>`;
          await prisma.verificationCodes.create({
            data: {
              code,
              user: {
                connect: {
                  id: user.id,
                },
              },
            },
          });
          await sendMail({ to: user.email, html });
          return { user };
        } catch (error) {
          if (error instanceof PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
              throw new trpc.TRPCError({
                code: "CONFLICT",
                message: "User already exists",
              });
            }
          } else {
            throw new trpc.TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Something went wrong on the server.",
            });
          }
        }
      }
    ),

  logout: publicProcedure.mutation(async ({ ctx: { res } }) => {
    // console.log("loging-out");
    res.setHeader("Set-Cookie", serialize("jwt", "", { path: "/" }));
    return true;
  }),
  confirm: publicProcedure
    .input(confirmSchema)
    .mutation(async ({ ctx: { prisma, res }, input }) => {
      if (!!!input.id) {
        throw new trpc.TRPCError({
          code: "FORBIDDEN",
          message: "Expecting an encoded id in the requests.",
        });
      }

      const id = decode(input.id);
      const code = await prisma.verificationCodes.findFirst({
        where: {
          code: input.code,
          user: {
            id,
          },
        },
        include: {
          user: true,
        },
      });

      if (!code) {
        throw new trpc.TRPCError({
          code: "FORBIDDEN",
          message: "Invalid verification code.",
        });
      }

      const jwt = signJwt(code.user);
      res.setHeader("Set-Cookie", serialize("jwt", jwt, { path: "/" }));
      return {
        user: code.user,
      };
    }),
});
