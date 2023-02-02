### Pagination, tRPC, Prisma and Next.js

In this `README` we are going to create a basic pagination app using `prisma` and `trpc`. We will be using [this repository](https://github.com/CrispenGari/node-startup/tree/main/node-backend/27_tRPC/jwt-cookies-auth) as the reference to this one.

### What are we going to build?

We are going to build a basic api for adding posts to the prisma database and query them using page pagination with a `next.js` client.

### Getting Started

First you need to create a `next` application by running the following command

```shell
yarn create next-app . --typescript
```

You will need to install the following packages after creating a `next-app`

```shell
yarn add dayjs @trpc/client @trpc/server @tanstack/react-query @trpc/react @trpc/next zod react-query superjson jotai @prisma/client react-hook-form @trpc/react-query
```

### Server

Next we are going to create a `server.ts` file in the `src/server` folder and add the following code in it.

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

Our `src/server/context.ts` file will look as follows

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

In our `utils/prisma.ts` we will have the following code in it:

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

We will need to create a file called `pages/api/trpc/[trpc].ts` and add the following code in it.

```ts
import { createContext } from "@/server/context";
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

In our `_app.tsx` file we will modify it to look as follows:

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

Inside the `src/constants/index.ts` file we are going to have the following code in it:

```ts
export const baseUrl: string = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : "http://localhost:3000";

export const url: string = `${baseUrl}/api/trpc`;
```

In the `src/server/routes/app.router.ts` we are going to have the following in it:

```ts
import { router } from "../server";
import { postRoutes } from "./post.router";
export const appRouter = router({
  post: postRoutes,
});

export type AppRouter = typeof appRouter;
```

Next we will need to define our `prisma` model. To initialize prisma we are going to run the following command

```shell
npx prisma init
```

Then a `prisma/schema.prisma` file will be created in the root folder of our project and we will then go ahead and modify it by creating a `Post` model that looks as follows:

```prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL") // DATABASE_URL="file:./db.sqlite"
}


model Post{
  id       String  @unique @default(uuid())
  text    String

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

After that we will need to run migrations by running the following command:

```shell
npx prisma migrate dev --name init
```

After that we can now go to our `src/server/routes/post.router.ts` and add the mutation and query for our post. But before we do that we want to define a create `schema` inside the `src/server/schema/post.schema.ts` using `zod` and add the following to it.

```ts
import { z } from "zod";

export const postSchema = z.object({
  text: z.string().min(5).max(300),
});

export type PostInput = z.TypeOf<typeof postSchema>;
```

Now we can go ahead and start creating a procedure that allows us to add some posts and getting all the posts. For now our query does not support pagination we are going to add pagination later on.

```ts
import { postSchema } from "../schema/post.schema";
import { publicProcedure, router } from "../server";

export const postRoutes = router({
  create: publicProcedure
    .input(postSchema)
    .mutation(async ({ ctx: { prisma }, input: { text } }) => {
      const post = await prisma.post.create({
        data: { text },
      });

      return { post };
    }),
  all: publicProcedure.query(async ({ ctx: { prisma } }) => {
    const posts = await prisma?.post.findMany({});
    return { posts };
  }),
});
```

Now in our `index.tsx` we are going to create a `form` that will allow as to add data to using `trpc`.

```ts
import React from "react";
import styles from "@/styles/Home.module.css";
import { useForm } from "react-hook-form";
import { PostInput } from "@/server/schema/post.schema";
import { trpc } from "@/utils/trpc";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocal from "dayjs/plugin/updateLocale";
import { Post } from "@prisma/client";
import { useScrollPosition } from "@/hooks/useScrollPosition";

dayjs.extend(relativeTime);
dayjs.extend(updateLocal);

dayjs.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s",
    s: "1m",
    m: "1m",
    mm: "%dm",
    h: "1h",
    hh: "%dh",
    d: "1d",
    dd: "%dd",
    M: "1M",
    MM: "%dM",
    y: "1y",
    yy: "%dy",
  },
});

const limit: number = 4;
const Home = () => {
  const { handleSubmit, register, reset } = useForm<PostInput>();
  const { data, hasNextPage, fetchNextPage, isFetching } =
    trpc.post.all.useInfiniteQuery(
      {
        limit,
      },
      {
        keepPreviousData: true,
        getNextPageParam: ({ nextCursor }) => nextCursor,
      }
    );

  const { mutateAsync, isLoading } = trpc.post.create.useMutation();
  const [posts, setPosts] = React.useState<Post[]>([]);
  const onSubmit = async (values: PostInput) => {
    if (isLoading) return;
    mutateAsync({ ...values }).then(({ post }) => {
      setPosts((state) => [post, ...state]);
    });
    reset();
  };
  const scrollPosition = useScrollPosition();
  React.useEffect(() => {
    let mounted: boolean = true;
    if (mounted && data?.pages) {
      setPosts(data.pages.flatMap((page) => page.posts) ?? []);
    }
    return () => {
      mounted = false;
    };
  }, [data]);

  console.log({ hasNextPage });
  React.useEffect(() => {
    if (scrollPosition > 90 && hasNextPage && !isFetching) {
      console.log("fetching");
      fetchNextPage();
    }
  }, [scrollPosition, hasNextPage, isFetching, fetchNextPage]);
  return (
    <div className={styles.home}>
      <div className={styles.home__main}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <textarea
            placeholder="What do you want to say?"
            {...register("text")}
          />
          <button type="submit">POST</button>
        </form>
        <div className={styles.home__main__main}>
          {posts.map((post) => (
            <div key={post.id} className={styles.home__post}>
              <h1>{dayjs(post.createdAt).fromNow()} ago</h1>
              <p>{post.text} </p>
            </div>
          ))}

          {isFetching ? <p>fetching...</p> : <p>No more posts...</p>}
        </div>
      </div>
    </div>
  );
};
export default Home;
```

So this is the basic logic for fetching data using pagination. The `useScrollPosition` hook will be located in the `src/hooks/useScrollPosition.ts` and it will look as follows. This hook basically detemines if we are `90%` or bellow the `page` bottom

```ts
import { useState, useEffect } from "react";

export const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleScroll = () => {
    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    const winScroll =
      document.body.scrollTop || document.documentElement.scrollTop;
    const scrolled = (winScroll / height) * 100;
    setScrollPosition(scrolled);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return scrollPosition;
};
```

On the server we will need to modify our `post.schema.ts` file to look as follows:

```ts
import { z } from "zod";

export const postSchema = z.object({
  text: z.string().min(5).max(300),
});

export const getPostsSchema = z.object({
  cursor: z.string().nullish(),
  limit: z.number().min(1).max(100).default(3),
});

export type PostInput = z.TypeOf<typeof postSchema>;
```

Also our logic for fetching post will be changed in the `post.router.ts` to have pagination in the `query` and it will be changed to look as follows:

```ts
import { getPostsSchema, postSchema } from "../schema/post.schema";
import { publicProcedure, router } from "../server";

export const postRoutes = router({
  create: publicProcedure
    .input(postSchema)
    .mutation(async ({ ctx: { prisma }, input: { text } }) => {
      const post = await prisma.post.create({
        data: { text },
      });

      return { post };
    }),
  all: publicProcedure
    .input(getPostsSchema)
    .query(async ({ ctx: { prisma }, input: { cursor, limit } }) => {
      const posts = await prisma.post.findMany({
        take: limit + 1,
        orderBy: [
          {
            createdAt: "desc",
          },
        ],
        cursor: cursor ? { id: cursor } : undefined,
      });

      let nextCursor: typeof cursor | undefined = undefined;

      if (posts.length > limit) {
        const nextItem = posts.pop() as typeof posts[number];

        nextCursor = nextItem.id;
      }

      return {
        posts,
        nextCursor,
      };
    }),
});
```

That's the basic about pagination with `trpc`, `next.js` and `prisma`

### Refs

1. [day.js](https://day.js.org/docs/en/installation/typescript)
