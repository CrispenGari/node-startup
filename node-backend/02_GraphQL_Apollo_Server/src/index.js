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
        setTimeout(() => pubsub.publish(NEW_USER, { newUser: null }), 0);
        return pubsub.asyncIterator(NEW_USER);
      },
    },
    allUsers: {
      subscribe: (parent, { id }) => {
        console.log(id);
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
