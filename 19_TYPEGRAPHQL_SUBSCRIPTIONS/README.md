### Type-GraphQL Subscriptions and TypeORM

In this one we are going to learn how we can intergrate type-graphql subscriptions with typeorm.

### What are we going to create?

We are going to create a simple graphQL api that will use subscriptions to listen to changes in the `insert` of the data in the database.

### Installation of required packages.

```shell
yarn add typeorm reflect-metadata mysql2 express graphql apollo-server-express type-graphql class-validator graphql-subscriptions subscriptions-transport-ws

# types
yarn add -D @types/mysql2 @types/graphql
```

### Creating the database for posts

Run the following command in mysql client

```sql
CREATE DATABASE IF NOT EXISTS posts;
```

Now we are going to create our entity `Post` which looks as follows:

```ts
import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@ObjectType()
@Entity({ name: "posts" })
export class Post extends BaseEntity {
  constructor(caption: string) {
    super();
    this.caption = caption;
  }
  @Field(() => Int)
  @PrimaryGeneratedColumn({ type: "int" })
  id: number;

  @Field(() => String)
  @Column({ nullable: false, unique: true })
  caption: string;

  @Field(() => String)
  @CreateDateColumn({ nullable: false })
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn({ nullable: false })
  updatedAt: Date;
}
```

In our `server.ts` file we are going to have th following code in it:

```ts
import "reflect-metadata";
import express, { Application } from "express";
import { createConnection } from "typeorm";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { PostsResolver } from "./resolvers/Posts";
(async () => {
  await createConnection();
  const app: Application = express();
  const apolloSever = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostsResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({
      req,
      res,
    }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground({})],
  });
  await apolloSever.start();
  apolloSever.applyMiddleware({ app, path: "/" });
  app.listen(3001, () =>
    console.log("The server has started at port: %d", 3001)
  );
})()
  .then(() => {})
  .catch((err) => console.error(err));
```

We are then going to create a `PostsResolver` in the `resolvers/Posts.ts` file as follows:

```ts
import { Post } from "../entity/Post/Post";
import { Arg, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class PostsResolver {
  @Mutation(() => Post)
  async createPost(
    @Arg("caption", () => String) caption: string
  ): Promise<Post> {
    const post = new Post(caption);
    return await post.save();
  }
  @Query(() => [Post])
  async allPosts(): Promise<Post[]> {
    return await Post.find({});
  }
}
```

### GraphQL subscriptions

Graphql subscriptions use `websokets` behind the scenes. To add subscriptions we need to change the code in our `server.ts` to look as follows:

```ts
import "reflect-metadata";
import express, { Application } from "express";
import { createServer } from "http";
import { execute, subscribe } from "graphql";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { createConnection } from "typeorm";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { PostsResolver } from "./resolvers/Posts";
(async () => {
  await createConnection();
  const app: Application = express();
  const httpServer = createServer(app);

  const schema = await buildSchema({
    resolvers: [PostsResolver],
    validate: false,
  });
  const subscriptionServer = SubscriptionServer.create(
    { schema, execute, subscribe },
    { server: httpServer, path: "/" }
  );
  const apolloSever = new ApolloServer({
    schema,
    context: ({ req, res }) => ({
      req,
      res,
    }),
    plugins: [
      ApolloServerPluginLandingPageGraphQLPlayground({}),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              subscriptionServer.close();
            },
          };
        },
      },
    ],
  });
  await apolloSever.start();
  apolloSever.applyMiddleware({ app, path: "/" });
  httpServer.listen(3001, () =>
    console.log("The server has started at port: %d", 3001)
  );
})()
  .then(() => {})
  .catch((err) => console.error(err));
```

With this we can go ahead and write some subscriptions in the `Post` resolvers.

```ts
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
  })
  newPost(@Root() postPayload: Post): Post {
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
```

Now we are able to listen to `allPostsSubscription` and `newPost` subscription and they will send data as soon as we create a new post.
