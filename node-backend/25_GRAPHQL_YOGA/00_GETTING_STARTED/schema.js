import { createSchema, createPubSub } from "graphql-yoga";

const pubSub = createPubSub();
export const schema = createSchema({
  typeDefs: `
    type Query{
        hello: String!
    }
    type Subscription {
        countdown(from: Int!): Int!
    }
    type Subscription{
        message: String!
    }
    type Mutation{
        sendMessage(message: String!): Boolean!
    }
    scalar File

    type Mutation {
        readTextFile(file: File!): String!
    }
    `,
  resolvers: {
    Query: {
      hello: (_, _args, context) => {
        console.log(context.someNumber);
        return "hello world";
      },
    },
    Subscription: {
      countdown: {
        // This will return the value on every 1 sec until it reaches 0
        subscribe: async function* (_, { from }) {
          for (let i = from; i >= 0; i--) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            yield { countdown: i };
          }
        },
      },
      message: {
        // subscribe to the newMessage event
        subscribe: () => pubSub.subscribe("newMessage"),
        resolve: (payload) => payload,
      },
    },
    Mutation: {
      sendMessage: (_, args) => {
        // publish a new message
        pubSub.publish("newMessage", args.message);
        return true;
      },
    },
    Mutation: {
      readTextFile: async (_, { file }) => {
        const textContent = await file.text();
        return textContent;
      },
    },
  },
});
