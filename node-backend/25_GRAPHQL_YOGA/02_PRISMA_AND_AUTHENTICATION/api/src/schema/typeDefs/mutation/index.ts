export const Mutation = ` 
type Mutation{
    message(message: String!): String!
    register(input: UserInput!): UserResponse!
    login(input: UserInput!): UserResponse!
}`;
