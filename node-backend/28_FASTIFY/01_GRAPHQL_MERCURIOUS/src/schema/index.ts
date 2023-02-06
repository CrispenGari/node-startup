export const schema = `
    type Query {
      hello(name: String): String!
    }
    type Mutation{
        add(num1: Int!, num2: Int!): Int!
    }
`;
