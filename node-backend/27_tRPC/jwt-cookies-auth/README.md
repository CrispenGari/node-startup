### tRPC and NextJs

In this Readme we are going to walk through how to use `tRPC` in a `monorepo` project with `Next.js`.

### What is TRPC?

(Transactional Remote Procedure Call) - End-to-end typesafe APIs made easy. Automatic typesafety & autocompletion inferred from your API-paths, their input data, & outputs .

### Getting started

To get started we are going to create a next application by running the following command.

```shell
yarn create next-app user-posts --typescript
```

### What we are going to build?

We are going to build a basic authentication application.

### What are we going to use?

In this project we are going to use the following technologies.

1. [Zod](https://zod.dev/) - typescript first schema validation
2. [Nodemailer](https://nodemailer.com/about/) - for sending emails
3. [NextJs](https://nextjs.org/) - for frontend
4. [tRPC](https://trpc.io/docs/quickstart)
5. [PRISMA](https://www.prisma.io/) - ORM database
6. [MySQL]() - our database driver with prisma
7. [React Hook Form](https://react-hook-form.com/) - Simple form validation with React Hook Form.
8. [JWT](https://jwt.io/) - JSON Web Token (JWT) is a compact URL-safe means of representing claims to be transferred between two parties.
9. [cookie](https://www.npmjs.com/package/cookie) - Basic HTTP cookie parser and serializer for HTTP servers. Installation. This is a Node.js module available through the npm registry.

### Installation

After a next application is installed, next we are going to install all the dependencies that we are going to use in this project. We are going to install the following:

```shell
yarn add @trpc/client @trpc/server @tanstack/react-query @trpc/react @trpc/next zod react-query superjson jotai @prisma/client react-hook-form jsonwebtoken cookie nodemailer @trpc/react-query argon2
```

Next we are going to install some `typescript` types of the following packages

```shell
yarn add -D @types/jsonwebtoken @types/cookie @types/nodemailer @types/argon2
```

After all the installations has finished we are going to start writing our code. First you need to check the `tsconfig.json` file and make sure that `strict` property under compiler options is set to `true` and also `strictNullChecks` is set to `true`:

```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true
  }
}
```

We will first start by creating a folder called `server` in the `src` folder and create two files `context.ts` and `server.ts` in that folder. Let's start by opening `context.ts` and add the following code into it:

```ts
import { NextApiResponse, NextApiRequest } from "next";
export const createContext = ({
  req,
  res,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
}) => {
  return {
    req,
    res,
  };
};

export type ContextType = ReturnType<typeof createContext>;
```

Next we are going to open the `server.ts` and add the following code into it.

```ts
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ContextType } from "./context";

const t = initTRPC.context<ContextType>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const publicProcedure = t.procedure;
export const middleware = t.middleware;
export const mergeRouters = t.mergeRouters;
export const router = t.router;
```

In the server we are going to create a folder called `routes` and in this folder we are going to create our routes functionalities. We will create a file called `app.router.ts` that will contain the following code in it.

```ts
import { router, publicProcedure } from "../server";
import { z } from "zod";

export const appRouter = router({
  hello: publicProcedure
    .input(
      z.object({
        name: z
          .string()
          .min(3, { message: "minimum of 3 characters" })
          .max(10, { message: "maximum of 10 characters" }),
      })
    )
    .output(z.object({ message: z.string() }))
    .query(({ ctx, input: { name } }) => {
      return {
        message: `Hello ${name}`,
      };
    }),
});

export type AppRouter = typeof appRouter;
```

Now that we have our `hello world` trpc `procedure-call` we can go ahead and integrate it in the next application. We will start by opening the `src/utils/trpc.ts` file and add the following code it it

```ts
import { createTRPCReact } from "@trpc/react-query";
import { AppRouter } from "../server/routes/app.router";

export const trpc = createTRPCReact<AppRouter>();
```

After that we are going to open the `pages/api` folder and create a folder called `trpc` which will have a file `[trpc].ts` file in it

```ts
import { createContext } from "@/server/createContext";
import { appRouter } from "@/server/routes/app.router";
import * as trpcNext from "@trpc/server/adapters/next";

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: createContext,
  onError: ({ error }) => {
    if (error.code === "INTERNAL_SERVER_ERROR") {
      console.error("Something went wrong", error);
    } else {
      console.error(error);
    }
  },
});
```

Next we will open the `_app.tsx` file and add the following code it it:

```ts
import { AppRouter } from "@/server/routes/app.router";
import "@/styles/globals.css";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { withTRPC } from "@trpc/next";
import superjson from "superjson";
import type { AppProps } from "next/app";
import { url } from "@/constants";

const App = ({ Component, pageProps }: AppProps) => {
  return <Component {...pageProps} />;
};

export default withTRPC<AppRouter>({
  config({ ctx }) {
    const links = [
      loggerLink(),
      httpBatchLink({
        url,
      }),
    ];
    return {
      queryClientConfig: {
        defaultOptions: {
          queries: {
            staleTime: 60,
          },
        },
      },
      headers() {
        if (ctx?.req) {
          return {
            ...ctx.req.headers,
            "x-ssr": "1",
          };
        }
        return {};
      },
      links,
      transformer: superjson,
    };
  },
  ssr: false,
})(App);
```

Now we can go ahead and start the server by running the following command:

```shell
yarn dev
```

### Hello Query

When the server started we now we can go ahead and make our first query in the `pages/index.tsx`

```ts
import { Inter } from "@next/font/google";
import styles from "@/styles/Home.module.css";
import { trpc } from "../utils/trpc";

const inter = Inter({ subsets: ["latin"] });

const Home = () => {
  const { isLoading, data } = trpc.hello.useQuery({ name: "hello" });
  return (
    <div>
      <pre>
        <code>{JSON.stringify({ isLoading, data }, null, 2)}</code>
      </pre>
    </div>
  );
};

export default Home;
```

Now we should be able to see the following `JSON` object in the `dom`. This shows that our `API` is working.

```json
{
  "isLoading": false,
  "data": {
    "message": "Hello hello"
  }
}
```

### Refactoring

In this project we are going to create an authentication flow application that allows users to get authenticated and create posts. So we will need to create a lot of routes. So in our `server/routes` we are going to create a `hello.router.ts` file which will contain the procedure calls for all the mutations and `queries` for `hello` and it looks as follows:

```ts
import { z } from "zod";
import { publicProcedure, router } from "../server";

export const helloRouter = router({
  greeting: publicProcedure
    .input(
      z.object({
        name: z
          .string()
          .min(3, { message: "minimum of 3 characters" })
          .max(10, { message: "maximum of 10 characters" }),
      })
    )
    .output(z.object({ message: z.string() }))
    .query(({ ctx, input: { name } }) => {
      return {
        message: `Hello ${name}`,
      };
    }),
  fromTRPC: publicProcedure.query(({ ctx }) => "Hello from TRPC"),
});
```

Now in our `app.router.ts` we are going to modified it to look as follows:

```ts
import { router } from "../server";
import { helloRouter } from "./hello.router";
export const appRouter = router({
  hello: helloRouter,
});

export type AppRouter = typeof appRouter;
```

Which means even calling the `api` on the client will be change to.

```ts
const { isLoading, data } = trpc.hello.greeting.useQuery({ name: "hello" });
const { isLoading: l, data: fromTRPC } = trpc.hello.fromTRPC.useQuery();
```

### Database

Now that we have set up `end-to-end` schema validation in our `monorepo` we can now move on and setup the `Prisma` database. To initialize prisma in our project we are going to run the following command:

```shell
npx prisma init
```

After that a folder called `prisma` will be created in the root folder of our project and we will start building our `prisma` schema by opening the `schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id       String  @unique @default(uuid())
  email    String  @unique
  username String  @unique
  password String
  avatar   String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

So every time when we make changes to our `schema.prisma` file we need to run the following command to create migration.

```shell
npx prisma migrate dev --name
```

Example:

```shell
npx prisma migrate dev user-table
```

If you want prisma to generate relations or format your `schema.prisma` file you run the following command:

```shell
npx prisma format
```

In the `.env` file we are going to change the `DATABASE_URL` to the one one that will use `mysql` in my local computer and it will look as follows.

```shell
DATABASE_URL="mysql://root:root@localhost:3306/userpost?schema=public"
```

We will need to create a database called `user-post` by running the following command in `MySQL Client`

```sql
CREATE DATABASE IF NOT EXISTS userpost;
```

### Context

Now that we have our prisma we can go ahead and put prisma in the context, in the `server/context.ts`

```ts
import { NextApiResponse, NextApiRequest } from "next";
import { prisma } from "../utils/prisma";
export const createContext = ({
  req,
  res,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
}) => {
  return {
    req,
    res,
    prisma: prisma,
  };
};

export type ContextType = ReturnType<typeof createContext>;
```

But the `prisma` object is coming from `utils/prisma.ts` file which looks as follows

```ts
import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV === "production") {
  global.prisma = prisma;
}
```

> Note that we are declaring `global` namespace prisma and check if we have a prisma instance that is running to avoid getting a warning of initializing multiple `prisma` clients.

### Register the user

To register the user we are going to do the following for simplicity purpose.

1. create a user.
2. send them a token via email.

So the logic to do that on the server is as fo

```ts
export const userRouter = router({
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
});
```

We are going to send the verification code via email using `nodemailer` and the functionality of doing that will be found in the `utils/mailer.ts` and it looks as follows:

```ts
import nodemailer from "nodemailer";

export const sendMail = async ({ to, html }: { to: string; html: string }) => {
  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  const info = await transporter.sendMail({
    from: '"Admin" <foo@example.com>',
    to,
    subject: "confirm email",
    html,
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
};
```

On the frontend together with the `useForm` hook from the `react-hook-form` we are going to allow the user to register. And when there are no error we will redirect them to the `confirm` email page. The logic for doing that will be found in the `pages/register.tsx` and it looks as follows:

```ts
import { RegisterInput } from "@/server/schema/user.schema";
import { encode } from "@/utils/base64";
import { trpc } from "@/utils/trpc";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";

interface Props {}
const Register: React.FC<Props> = ({}) => {
  const { register, handleSubmit } = useForm<RegisterInput>();
  const { mutate, error, data } = trpc.user.register.useMutation({});

  const router = useRouter();
  const onSubmit = (values: RegisterInput) => {
    mutate(values);
  };

  React.useEffect(() => {
    let mounted: boolean = true;
    if (mounted && !!data?.user) {
      router.replace(`/confirm?id=${encode(data.user.id)}`);
    }
    return () => {
      mounted = false;
    };
  }, [router, data]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Register</h1>
      <input type="email" placeholder="email" {...register("email")} />
      <br />
      <input type="text" placeholder="username" {...register("username")} />
      <br />
      <input type="password" placeholder="password" {...register("password")} />
      <br />
      <button type="submit">REGISTER</button>
      <br />
      {error ? <p>{error.message}</p> : null}
      <br />
      <Link href={"/login"}>Login</Link>
    </form>
  );
};
export default Register;
```

> Note that when the registration is complete we are going to redirect to the `confirm` email page with the `query` parameter id which is the `base64-encoded` version of the `id` which will be decoded on the server. The utility functions for doing that will be found in the `utils/base64.ts` and it looks as follows:

```ts
export const encode = (data: any) => {
  return Buffer.from(data, "utf-8").toString("base64");
};

export const decode = (data: string) => {
  return Buffer.from(data, "base64").toString("utf-8");
};
```

### Confirming Email

After the confirmation code has been sent to their email, we will need to verify that code, if the code is valid we redirected them to the `home` page. So on the `server` we are going to take the `verification-code` together with the `encoded` id of the `code` and verify it. If everything went well we are going to store the `cookie` `jwt` in the browser so that we can persist the user. So the utility functions for `signing` and `verifying` `jwt` tokens will be found in the `utils/jwt.ts` and it will be looking as follows:

```ts
import { User } from "@prisma/client";
import jwt from "jsonwebtoken";

const TOKEN_SECRET = process.env.TOKEN_SECRET || "dfghjklUaooajjhaj";
export const signJwt = ({ username, email, id }: User) => {
  return jwt.sign(
    {
      id,
      email,
      username,
    },
    TOKEN_SECRET
  );
};

export const verifyJwt = (token: string) => {
  return jwt.verify(token, TOKEN_SECRET) as {
    username: string;
    email: string;
    id: string;
  };
};
```

The logic for confirming the verification code will look as follows:

```ts
export const userRouter = router({
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
```

So On the client side the verification code together with the encoded verification code `id` will be send to the server as follows in the `confirm.tsx`

```ts
import { ConfirmInput } from "@/server/schema/user.schema";
import { trpc } from "@/utils/trpc";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";

interface Props {}
const Confirm: React.FC<Props> = ({}) => {
  const { register, handleSubmit } = useForm<ConfirmInput>();
  const { mutate, error, data } = trpc.user.confirm.useMutation({});
  const router = useRouter();

  const onSubmit = (values: ConfirmInput) => {
    mutate({ ...values, id: (router.query.id as string) ?? undefined });
  };

  React.useEffect(() => {
    let mounted: boolean = true;
    if (mounted && !!data?.user) {
      router.replace(`/`);
    }
    return () => {
      mounted = false;
    };
  }, [router, data]);
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Confirm Email</h1>
      <input type="text" placeholder="000-000" {...register("code")} />
      <br />
      <button type="submit">VERIFY</button>
      <br />
      {error ? <p>{error.message}</p> : null}
      <br />
      <Link href={"/register"}>Register</Link>
    </form>
  );
};

export default Confirm;
```

### User

Next we want to be able to grab the user based on the `token` that is stored in the browser `cookies`. So on the server we are going to create a procedure call that will handle that for us as a query. In our `server/context.ts` we will have the following.

```ts
import { User } from "@prisma/client";
import { NextApiResponse, NextApiRequest } from "next";
import { prisma } from "../utils/prisma";

export const createContext = ({
  req,
  res,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
}) => {
  return {
    req,
    res,
    prisma: prisma,
  };
};

export type ContextType = ReturnType<typeof createContext>;
```

In our `server/routes/user.router.ts` we are going to have the following procedure call for the `me` query

```ts
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
});
```

We are going to use this to check if the user `isLoggedIn` or `not`. This whole logic will happen in the `pages/index.tsx` and will look as follows

```tsx
import { useRouter } from "next/router";
import React from "react";
import { trpc } from "../utils/trpc";

const Home = () => {
  const { data, isLoading } = trpc.user.me.useQuery();
  const router = useRouter();
  React.useEffect(() => {
    let mounted: boolean = true;
    if (mounted && !isLoading) {
      if (!!!data) {
        router.replace("/login");
      } else {
        router.replace("/");
      }
    }
  }, [isLoading, data, router]);
  if (isLoading) {
    return <div>loading...</div>;
  }

  return (
    <div>
      <pre>
        <code>{JSON.stringify({ isLoading, data }, null, 2)}</code>
      </pre>
    </div>
  );
};

export default Home;
```

### Logout

Logging out the user is just clearing the `cookie` so the `logout` procedure will look as follows:

```ts
export const userRouter = router({
  logout: publicProcedure.mutation(async ({ ctx: { res } }) => {
    res.setHeader("Set-Cookie", serialize("jwt", "", { path: "/" }));
    return true;
  }),
});
```

We are going to call the `logout` mutation when the button is `clicked` and do a full page refresh so that if you are not authenticated you will be redirected to the login page.

### Login

To login the user you just need to check if the user exist in the database with the given credentials and then set the cookies accordingly. So in our `server/routes/user.route.ts` we are going to create a `login` procedure call that looks as follows:

```ts
export const userRouter = router({
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
});
```

Now on the client we are going to have the following in the `pages/login.tsx`.

```tsx
import { LoginInput } from "@/server/schema/user.schema";
import { trpc } from "@/utils/trpc";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";

interface Props {}
const Login: React.FC<Props> = ({}) => {
  const { register, handleSubmit } = useForm<LoginInput>();
  const { mutate, error, data } = trpc.user.login.useMutation({});

  const router = useRouter();
  const onSubmit = (values: LoginInput) => {
    mutate(values);
  };

  React.useEffect(() => {
    let mounted: boolean = true;
    if (mounted && !!data?.user) {
      router.replace(`/`);
    }
    return () => {
      mounted = false;
    };
  }, [router, data]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Login</h1>
      <input type="email" placeholder="email" {...register("email")} />
      <br />
      <input type="password" placeholder="password" {...register("password")} />
      <br />
      <button type="submit">LOGIN</button>
      <br />
      {error ? <p>{error.message}</p> : null}
      <br />
      <Link href={"/register"}>Register</Link>
    </form>
  );
};
export default Login;
```

This is how we can do basic authentication using `next.js` and `trpc`.

### Middleware

You can add a middle-ware function in the public procedure that will protect you from accessing some resources. A basic example can be found in the [docs](https://trpc.io/docs/middlewares).

```ts
const isAdmin = middleware(async ({ ctx, next }) => {
  if (!ctx.user?.isAdmin) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

export const adminProcedure = publicProcedure.use(isAdmin);
```

### Refs

1. [Zod](https://zod.dev/)
1. [Zod](https://zod.dev/) - typescript first schema validation
1. [Nodemailer](https://nodemailer.com/about/) - for sending emails
1. [NextJs](https://nextjs.org/) - for frontend
1. [tRPC](https://trpc.io/docs/quickstart)
1. [PRISMA](https://www.prisma.io/) - ORM database
1. [MySQL]() - our database driver with prisma
1. [React Hook Form](https://react-hook-form.com/) - Simple form validation with React Hook Form.
1. [JWT](https://jwt.io/) - JSON Web Token (JWT) is a compact URL-safe means of representing claims to be transferred between two parties.
1. [cookie](https://www.npmjs.com/package/cookie) - Basic HTTP cookie parser and serializer for HTTP servers. Installation. This is a Node.js module available through the npm registry.
1. [trpc.io](https://trpc.io/docs/quickstart#querying--mutating)
1. [migrate-from-v9-to-v10](https://trpc.io/docs/migrate-from-v9-to-v10)
1. [trpc.io/docs/v9/nextj](https://trpc.io/docs/v9/nextjs)
