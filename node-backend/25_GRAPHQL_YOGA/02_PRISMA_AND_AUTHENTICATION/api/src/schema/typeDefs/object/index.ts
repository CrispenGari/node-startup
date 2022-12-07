export const objectTypes = ` 
type User{
    username: String!
    email: String!
    id: Int!
  }
  type Error{
    field: String!
    message: String!
  }
  type UserResponse{
    user: User,
    error: Error
  }`;
