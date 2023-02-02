import { z } from "zod";

export const postSchema = z.object({
  text: z.string().min(5).max(300),
});

export const getPostsSchema = z.object({
  cursor: z.string().nullish(),
  limit: z.number().min(1).max(100).default(3),
});

export type PostInput = z.TypeOf<typeof postSchema>;
