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
