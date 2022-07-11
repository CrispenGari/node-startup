import { gql } from "@apollo/client";
const LOGIN_MUTATION = gql`
  mutation ($loginUser: UserInput) {
    login(user: $loginUser) {
      user {
        createdAt
        email
        username
        id
      }
      error {
        name
        message
      }
    }
  }
`;
export default LOGIN_MUTATION;
