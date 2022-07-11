import { Post } from "../entity/Post/Post";
import {
  Arg,
  Field,
  InputType,
  Int,
  Mutation,
  PubSub,
  Query,
  Resolver,
  Root,
  Subscription,
} from "type-graphql";
import { PubSubEngine } from "graphql-subscriptions";

enum Subscriptions {
  NEW_POST = "NEW_POST",
  ALL_POSTS = "ALL_POSTS",
}

@InputType()
class PostInputType {
  @Field(() => Int)
  cursor: number;

  @Field(() => Int)
  limit: number;
}

@Resolver()
export class PostsResolver {
  @Query(() => Boolean)
  async makeAllSubscriptions(@PubSub() pubSub: PubSubEngine): Promise<boolean> {
    const posts = await Post.find({});
    await pubSub.publish(Subscriptions.NEW_POST, null);
    await pubSub.publish(Subscriptions.ALL_POSTS, posts);
    return true;
  }

  @Mutation(() => Post)
  async createPost(
    @Arg("caption", () => String) caption: string,
    @PubSub() pubSub: PubSubEngine
  ): Promise<Post> {
    const post = await new Post(caption).save();
    const posts = await Post.find({});
    await pubSub.publish(Subscriptions.NEW_POST, post);
    await pubSub.publish(Subscriptions.ALL_POSTS, posts);
    return post;
  }
  @Query(() => [Post])
  async allPosts(): Promise<Post[]> {
    return await Post.find({});
  }

  @Subscription(() => Post, {
    topics: Subscriptions.NEW_POST,
    nullable: true,
  })
  newPost(@Root() postPayload: Post): Post | undefined {
    return postPayload;
  }

  @Subscription(() => [Post], {
    topics: Subscriptions.ALL_POSTS,
    // filter: ({ payload }: ResolverFilterData<Post>) => payload.id % 2 === 0,
  })
  allPostsSubscription(
    @Arg("input", () => PostInputType) { cursor, limit }: PostInputType,
    @Root() postPayload: [Post]
  ): Post[] {
    return postPayload.slice(cursor, limit);
  }
}
