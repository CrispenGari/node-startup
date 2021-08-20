import { gql } from "@apollo/client";
const LOGIN_MUTATION = gql`
  mutation ($loginUser: UserInput) {
    login(user: $loginUser) {
      error {
        message
        name
      }
      user {
        createdat
        username
        email
        id
      }
    }
  }
`;
export default LOGIN_MUTATION;
