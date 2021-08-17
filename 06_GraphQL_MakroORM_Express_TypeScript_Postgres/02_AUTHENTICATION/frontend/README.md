### Frontend of the Authentication

Setting `ApolloClient` with `next.js`. I'm going to follow [this](https://www.apollographql.com/blog/apollo-client/next-js/building-a-next-js-app-with-slash-graphql/) blog post to setup my `ApolloClient` in next.js. First we need to install the following:

Note: For the language I'm using typescript.

```bash
yarn add @apollo/client graphql
```

You don't need to worry about installing types because these modules comes with types.

1. Create a folder called `lib` and create a file called `apolloClient.ts`.
2. Inside that file we are going to add the following code in it:

```ts
import { useMemo } from "react";
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

let client: ApolloClient<any>;

const createApolloClient = (): ApolloClient<any> => {
  return new ApolloClient({
    credentials: "include",
    ssrMode: __ssrMode__,
    link: new HttpLink({
      uri,
      credentials: "include",
    }),
    cache: new InMemoryCache(),
  });
};
export const initializeApollo = (initialState = null) => {
  const apolloClient = client ?? createApolloClient();
  if (initialState) {
    const cache = apolloClient.extract();
    apolloClient.cache.restore({
      ...cache,
      ...initialState,
    });
  }
  if (typeof window === "undefined") return apolloClient;
  if (!client) client = apolloClient;
  return apolloClient;
};

export const useApollo = (initialState) => {
  return useMemo(() => initializeApollo(initialState), [initialState]);
};
```

First we are creating an instance of apollo:

```ts
let client: ApolloClient<any>;
```

We then create a function called `createApolloClient()` that returns apollo client. This function is resposible for creating a new apollo client.

```ts
const createApolloClient = (): ApolloClient<any> => {
  return new ApolloClient({
    credentials: "include",
    ssrMode: __ssrMode__,
    link: new HttpLink({
      uri,
      credentials: "include",
    }),
    cache: new InMemoryCache(),
  });
};
```

Note that in this function we have a property `ssrMode` which stands for `Server Side Rendering Mode`. How are we going to check if we are in `ssrMode`? Well when the `window` object is defined then we are on the client side.

We are then going to create a function called `initializeApollo()` which looks as follows:

```ts
export const initializeApollo = (initialState = null) => {
  const apolloClient = client ?? createApolloClient();
  if (initialState) {
    const cache = apolloClient.extract();
    apolloClient.cache.restore({
      ...cache,
      ...initialState,
    });
  }
  if (typeof window === "undefined") return apolloClient;
  if (!client) client = apolloClient;
  return apolloClient;
};
```

Finally in this file we will have a `hook` that we are going to create called `useApollo()` which takes the initial state and it looks as follows:

```ts
export const useApollo = (initialState) => {
  return useMemo(() => initializeApollo(initialState), [initialState]);
};
```

### Next

We will then go to the `_app.tsx` and wrap our app with the `ApolloProvider` and the `ApolloProvider` requires a `client` which we will create using our custom hook `useApollo()` and we are going to pass the `pageProps` to it. The `_app.tsx` will be looking as follows:

```ts
import "../styles/globals.css";

import { ApolloProvider } from "@apollo/client";
import { useApollo } from "../lib/apolloClient";
const App = ({ Component, pageProps }) => {
  const client = useApollo(pageProps.initialApolloState);

  return (
    <ApolloProvider client={client}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
};
export default App;
```

### Now we are able to make queries and mutations.

- We are going to create a folder called `graphql`
- Inside this folder we are going to have two folders in it which are `mutations` and `queries`:

### Hello world query

```ts
// graphql/queries/hello.ts
import { gql } from "@apollo/client";
export const HELLO_WORLD_QUERY = gql`
  query hello {
    hello
  }
`;
export default HELLO_WORLD_QUERY;
```

### How to use it

```ts
...
import { useQuery } from "@apollo/client";
import HELLO_WORLD_QUERY from "../graphql/queries/hello";

interface Props {}
const Login: React.FC<Props> = () => {
  const { loading, data, error } = useQuery(HELLO_WORLD_QUERY);
  if (loading) {
    console.log("loading");
  } else {
    console.log(data);
  }
....
};

export default Login;
```

### On the backend we are going to add `cors()`.

**Note**: `cors` id added before using the `express-session` middleware. The `server.ts` in the backend is now looking as follows:

```ts
import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import mikroOrmConfig from "./mikro-orm.config";
import express, { Application, Response, Request } from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { __port__ } from "./constants";
import { HelloResolver } from "./resolvers/hello";
import { UserResolver } from "./resolvers/user";

import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import cors from "cors";
const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getMigrator().up();

  const app: Application = express();

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  app.use(
    cors({
      credentials: true,
      origin: "http://localhost:3000",
    })
  );
  app.use(
    session({
      store: new RedisStore({ client: redisClient, disableTouch: true }),
      saveUninitialized: false,
      secret: "secret",
      resave: false,
      name: "user",
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        secure: false, // https when true
        sameSite: "lax",
      },
    })
  );

  /*
  Since it is a graphql server we are don't care
  about other routes.
  */
  app.get("/", (_req: Request, res: Response) => {
    return res.status(200).redirect("/graphql");
  });
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      validate: false,
      resolvers: [HelloResolver, UserResolver],
    }),
    context: ({ req, res }) => ({ em: orm.em, req, res }),
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, cors: false });
  app.listen(__port__, () =>
    console.log("The server has started at port: %d", __port__)
  );
};

main()
  .then(() => {})
  .catch((error) => console.error(error));
```
