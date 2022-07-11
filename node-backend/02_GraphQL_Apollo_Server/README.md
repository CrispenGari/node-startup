### Apollo Server(GraphQL)

In this one we are going to have a quick look at the [Apollo Server GraphQL](https://www.apollographql.com/docs/apollo-server/) and build graphql api.

### Getting started

First we need to initialize our project using the following command:

```shell
yarn init -y
```

### Installation of Apollo Server and GraphQL

```shell
yarn add apollo-server graphql
```

### Scripts

We are then going to create our `scripts` in the `package.json` file. The `script` that will will be using is `start`. This script will start the server using `nodemon` which is installed globally.

```json
"scripts": {
    "start": "nodemon src/index.js"
  }
```

1. Hello world api

Next we are going inside the `src/index.js` and create our `hello world` api as follows:

```js
const { ApolloServer, gql } = require("apollo-server");
const {
  ApolloServerPluginLandingPageGraphQLPlayground,
} = require("apollo-server-core");

const typeDefs = gql`
  type Query {
    helloWorld: String!
  }
`;
const resolvers = {
  Query: {
    helloWorld: () => "hello world",
  },
};
const server = new ApolloServer({
  typeDefs,
  resolvers,
  cors: false,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground({})],
});

server
  .listen({
    port: 3001,
  })
  .then(({ url }) => console.log(`the server is running on: ${url}`));
```

Our apollo server is running on `port` 3001 which i override the default port of `4000` by specifying the `port: 3001` in the `server.listen()`.

- `typeDefs` defines our graphql types. In our case we have a `Query` type
- `resolvers` implements the defined types, for example the `helloWord` query.

Now we can go to `http://localhost:3001/` and we will see the `GraphQL Playground`. If we write the following query:

```
{
  helloWorld
}
```

We will get the following response:

```json
{
  "data": {
    "helloWorld": "hello world"
  }
}
```

### Queries

Queries in graphql helps us to get the data from the server.

### Mutations

Mutations helps us to modify the data on the server. This include operations like `INSERT`, `UPDATE` and `DELETE`.

### GraphQL basic types, object types and input types

- Basic graphql types include types like `Strings`, `Enum`, `ID`, `Int`, etc.
- Object types are user-defined types which are build using the `type` graphql keyword and they are build using basic types.
- Input types are the same as `object types` and they are built using `input` graphql keyword, the only difference between the object type and input type is that object types are return types and input types are that are taken as input by graphql resolvers. We will make this clear when we go through the following example.

We are going to create a `register` that will do the following.

1. Create the user and store the user to a local variable
2. Create custom `input` and `object` type that we will reuse on the `login` mutation as follows:

```js
const users = [];

const typeDefs = gql`
  type Query {
    helloWorld: String!
  }
  type User {
    username: String!
    id: ID!
  }
  type Error {
    field: String!
    message: String!
  }
  type UserResponse {
    user: User
    error: Error
  }
  input UserInput {
    username: String!
    password: String!
  }
  type Mutation {
    register(input: UserInput): UserResponse
    login(input: UserInput): UserResponse
  }
`;
const resolvers = {
  Query: {
    helloWorld: () => "hello world",
  },
  Mutation: {
    register: (parent, { input: { username, password } }, context, info) => {
      const id = users.length;
      const isFound = users.find((user) => user.username === username);
      if (isFound) {
        return {
          error: {
            message: "the username is taken",
            field: "username",
          },
        };
      }
      const user = {
        username,
        password,
        id,
      };
      users.push(user);
      return {
        user,
      };
    },
    login: (parent, { input: { username, password } }, context, info) => {
      const user = users.find(
        (user) => user.username === username && user.password === password
      );
      if (user) return { user };
      return {
        error: {
          message: "invalid credentials",
          field: "username or password",
        },
      };
    },
  },
};
```

We created our `User` and `Error` types. We also created the `UserResponse` that also uses `User` and `Error` types. We created our `UserInput` input which takes two field, `username` and `password`.

Inside the `resolvers` we added the `login` and `register` mutations. Basically these two are the same. What you should note is that our `register` resolver takes in the following arguments:

```js
register: parent, args, context, info;
```

1. parent

   - GraphQL server performs a breadth-first traversal to create the query response. At each level it calls a resolver. The parent argument of the resolver is simply the result returned by the resolver at the previous level. The call to the root level resolver receives a null in this argument.

2. args
   - These are arguments that we are going to pass down to the resolver for example the `input` of type `UserInput`.
3. context
   - This is the context that is going to be passed down during creation of the `Apollo Server` for example:

```js
const server = new ApolloServer({
  typeDefs,
  resolvers,
  cors: false,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground({})],
  context: ({ req, res }) => ({ req, res }),
});
```

Now `req` and `res` are now our context, and we can destructure them in the resolver.

4. info

- An abstract syntax tree (AST) representation of the query or mutation — used only in advanced use cases.

> **Note:** this args that are passed received by resolvers are both the same for `queries` and `mutations`.

Now we are able to make the following graphql mutations from our playground:

1. register the user

```
mutation {
  register(input: { username: "username", password: "pass" }) {
    user {
      username
      id
    }
    error {
      field
      message
    }
  }
}

```

the following will be the response

```json
{
  "data": {
    "register": {
      "user": {
        "username": "username",
        "id": "0"
      },
      "error": null
    }
  }
}
```

2. login the user

```
mutation {
  login(input: { username: "username", password: "passs" }) {
    user {
      username
      id
    }
    error {
      field
      message
    }
  }
}

```

the following will be the response

```json
{
  "data": {
    "login": {
      "user": null,
      "error": {
        "field": "username or password",
        "message": "invalid credentials"
      }
    }
  }
}
```

Let's say on our object type `User` we want to be able to return the first two letter of the username for example if the username is `username` we want to return `US`. This is a computed property normally we do not store this in our database therefore we created a new field in the `User` types which tells graphql that we are going to "return the first two letter of the username". I'm going to call the `avatarPlaceholder`.

```js
const typeDefs = gql`
...
  type User {
    username: String!
    id: ID!
    avatarPlaceholder: String!
  }
 ...
`;
const resolvers = {
 ...
  User: {
    avatarPlaceholder: (parent) =>
      String(parent.username).slice(0, 2).toUpperCase(),
  },
  ...
};
```

With this modification we are now able to make the following mutations and be able to grab the computed field `avatarPlaceholder`:

1. Register

```
mutation {
  register(input: { username: "username", password: "pass" }) {
    user {
      username
      id
      avatarPlaceholder
    }
    error {
      field
      message
    }
  }
}
```

response:

```json
{
  "data": {
    "register": {
      "user": {
        "username": "username",
        "id": "0",
        "avatarPlaceholder": "US"
      },
      "error": null
    }
  }
}
```

2. Login

```
mutation {
  login(input: { username: "username", password: "pass" }) {
    user {
      username
      id
      avatarPlaceholder
    }
    error {
      field
      message
    }
  }
}
```

response:

```json
{
  "data": {
    "login": {
      "user": {
        "username": "username",
        "id": "0",
        "avatarPlaceholder": "US"
      },
      "error": null
    }
  }
}
```

### GraphQL Subscriptions

> _Subscriptions are long-lasting GraphQL read operations that can update their result whenever a particular server-side event occurs. Most commonly, updated results are pushed from the server to subscribing clients. For example, a chat application's server might use a subscription to push newly received messages to all clients in a particular chat room._ - [docs](https://www.apollographql.com/docs/apollo-server/data/subscriptions/)

1. The docs said we must swap to `apollo-server-express` so wee need to set up that.

- first we need to install additional dependencies

```shell
yarn add apollo-server-express apollo-server-core express
```

Now let's move on to subscriptions. We are going to install the the following additional packages.

```shell
yarn add subscriptions-transport-ws @graphql-tools/schema graphql-subscriptions
```

Now our index.js file will be looking as follows:

```js
const { ApolloServer, gql } = require("apollo-server-express");
const {
  ApolloServerPluginLandingPageGraphQLPlayground,
} = require("apollo-server-core");
const express = require("express");
const { createServer } = require("http");
const { execute, subscribe } = require("graphql");
const { SubscriptionServer } = require("subscriptions-transport-ws");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { PubSub } = require("graphql-subscriptions");
const pubsub = new PubSub();
const users = [];
...
const NEW_USER = "NEW_USER";
const resolvers = {
  Subscription: {
    newUser: {
      subscribe: () => pubsub.asyncIterator(NEW_USER),
    },
  },
  ...
  Mutation: {
    register: (parent, { input: { username, password } }, context, info) => {
      const id = users.length;
      const isFound = users.find((user) => user.username === username);
      if (isFound) {
        return {
          error: {
            message: "the username is taken",
            field: "username",
          },
        };
      }
      const user = {
        username,
        password,
        id,
      };
      users.push(user);
      pubsub.publish(NEW_USER, {
        newUser: user,
      });
      return {
        user,
      };
    },
   ...
  },
};
(async () => {
  const app = express();
  const httpServer = createServer(app);
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });
  const subscriptionServer = SubscriptionServer.create(
    { schema, execute, subscribe },
    { server: httpServer, path: "/" }
  );
  const server = new ApolloServer({
    schema,
    cors: false,
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
    context: ({ req, res }) => ({ req, res }),
  });
  await server.start();
  server.applyMiddleware({ app, path: "/" });
  httpServer.listen(3001);
})().then(() =>
  console.log(`the server is running on: http://localhost:3001/`)
);
```

### The whole code in the `index.js` file

```js
const { ApolloServer, gql } = require("apollo-server-express");
const {
  ApolloServerPluginLandingPageGraphQLPlayground,
} = require("apollo-server-core");
const express = require("express");
const { createServer } = require("http");
const { execute, subscribe } = require("graphql");
const { SubscriptionServer } = require("subscriptions-transport-ws");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { PubSub } = require("graphql-subscriptions");

const pubsub = new PubSub();

const users = [];

const typeDefs = gql`
  type Query {
    helloWorld: String!
  }
  type User {
    username: String!
    id: ID!
    avatarPlaceholder: String!
  }
  type Error {
    field: String!
    message: String!
  }
  type UserResponse {
    user: User
    error: Error
  }
  input UserInput {
    username: String!
    password: String!
  }
  type Mutation {
    register(input: UserInput): UserResponse
    login(input: UserInput): UserResponse
  }
  type Subscription {
    newUser: User
    allUsers(id: ID!): [User]!
  }
`;

const NEW_USER = "NEW_USER";
const ALL_USERS = "ALL_USERS";
const resolvers = {
  Subscription: {
    newUser: {
      subscribe: () => {
        // get a users as soon as we listen to the subscription
        setTimeout(() => pubsub.publish(NEW_USER, { newUser: null }), 0);
        return pubsub.asyncIterator(NEW_USER);
      },
    },
    allUsers: {
      subscribe: (parent, { id }) => {
        console.log(id);
        // get all the users as soon as we listen to the subscription
        setTimeout(() => pubsub.publish(ALL_USERS, { allUsers: users }), 0);
        return pubsub.asyncIterator(ALL_USERS);
      },
    },
  },
  Query: {
    helloWorld: () => "hello world",
  },
  User: {
    avatarPlaceholder: (parent) =>
      String(parent.username).slice(0, 2).toUpperCase(),
  },
  Mutation: {
    register: (parent, { input: { username, password } }, context, info) => {
      const id = users.length;
      const isFound = users.find((user) => user.username === username);
      if (isFound) {
        return {
          error: {
            message: "the username is taken",
            field: "username",
          },
        };
      }
      const user = {
        username,
        password,
        id,
      };
      users.push(user);
      pubsub.publish(ALL_USERS, {
        allUsers: users,
      });
      pubsub.publish(NEW_USER, {
        newUser: user,
      });
      return {
        user,
      };
    },
    login: (parent, { input: { username, password } }, context, info) => {
      const user = users.find(
        (user) => user.username === username && user.password === password
      );
      if (user) return { user };
      return {
        error: {
          message: "invalid credentials",
          field: "username or password",
        },
      };
    },
  },
};

(async () => {
  const app = express();
  const httpServer = createServer(app);
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });
  const subscriptionServer = SubscriptionServer.create(
    { schema, execute, subscribe },
    { server: httpServer, path: "/" }
  );
  const server = new ApolloServer({
    schema,
    cors: false,
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
    context: ({ req, res }) => ({ req, res }),
  });
  await server.start();
  server.applyMiddleware({ app, path: "/" });
  httpServer.listen(3001);
})().then(() =>
  console.log(`the server is running on: http://localhost:3001/`)
);
```

### Ref

1.  [Apollo Server GraphQL](https://www.apollographql.com/docs/apollo-server/)

2.  [Subscriptions](https://www.apollographql.com/docs/apollo-server/data/subscriptions/)
