import { makeExecutableSchema } from "graphql-tools";
export const schema = makeExecutableSchema({
  typeDefs: `
  type Query{
    hello: String!
  }
  type Mutation{
    message(message: String!): String!
  }
  `,
  resolvers: {
    Query: {
      hello: () => "Hello world",
    },
    Mutation: {
      message: (_, args, __) => {
        return args.message;
      },
    },
  },
});
