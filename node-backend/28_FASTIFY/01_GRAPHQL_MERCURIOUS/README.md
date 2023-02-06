### Fastify and Mercurious GraphQL

In this repository we are going to show how we can setup the graphql `API` using `fastify` and `Mercurious`. We are going to use the previous sub repository `00_GETTING_STARTED` as a reference to this repository.

```shell
yarn add fastify mercurius graphql
```

Let's open our `server.ts` and add the following code in it:

```ts
import Fastify from "fastify";
import mercurius from "mercurius";
import { resolvers } from "./resolvers";
import { schema } from "./schema";
import { CtxType } from "./types";

const PORT: any = process.env.PORT || 3001;
const HOST =
  process.env.NODE_ENV === "production"
    ? "0.0.0.0"
    : "localhost" || "127.0.0.1";

const fastify = Fastify({
  logger: true,
  ignoreTrailingSlash: true,
});

fastify.register(mercurius, {
  schema,
  resolvers,
  graphiql: true,
  context: (request, reply): CtxType => {
    const user = {
      username: "username",
      email: "email@gmail.com",
      age: 23,
      gender: "male",
    };
    return {
      req: request,
      rep: reply,
      user,
    };
  },
});

fastify.listen({ port: PORT, host: HOST }, (error, address) => {
  if (error) {
    fastify.log.error(error);
    process.exit(1);
  }
  fastify.log.info(` Server is now listening on ${address}`);
});
```

As you can see that we have a `schema` definition which is a string and is found in the `schema/index.ts` file and it looks as follows:

```ts
export const schema = `
    type Query {
      hello(name: String): String!
    }
    type Mutation{
        add(num1: Int!, num2: Int!): Int!
    }
`;
```

Then we are defining the `CxtType` in the `types/index.ts` which is basically the type of the context.

```ts
import { FastifyRequest, FastifyReply } from "fastify";
export type CtxType = {
  user?: {
    username: string;
    email: string;
    age: number;
    gender: string;
  };
  req: FastifyRequest;
  rep: FastifyReply;
};
```

Now in our `resolvers/index.ts` we are going to have the following code in it:

```ts
import { add } from "./mutation/add.mutation";
import { hello } from "./query/hello.query";

export const resolvers = {
  Query: {
    hello,
  },

  Mutation: {
    add,
  },
};
```

In the `resolvers/index.ts` that's where all our resolvers that we are going to create are going to leave.

#### Hello World Query

Inside the `resolvers/query/hello.query.ts` we are going to have the following code in it:

```ts
export const hello = async (
  root: any,
  {
    name,
  }: Partial<{
    name: string;
  }>,
  ctx: any
) => {
  console.log({ user: ctx.user });
  return `Hello ${!!name ? name : "World"}`;
};
```

#### Add Mutation

Inside the `resolvers/mutations/add.mutation.ts` we are going to have the following code in it:

```ts
export const add = async (
  root: any,
  {
    num1,
    num2,
  }: {
    num1: number;
    num2: number;
  },
  {}: any
) => {
  return num1 + num2;
};
```

Now if we open the browser on `http://127.0.0.1:3001/graphiql` and a `graphiql` playground will be shown and we will be able to make the following mutations and queries

1. hello world query

```shell
{
  hello(name: "there!!")
}
```

Response

```json
{
  "data": {
    "hello": "Hello there!!"
  }
}
```

2. add mutation

```shell
mutation{
  add(num1: 3, num2: 15)
}

```

Response

```json
{
  "data": {
    "add": 18
  }
}
```

### Refs

1. [mercurius](https://mercurius.dev/#/?id=mercurius)
