import { gql } from "@apollo/client";
const LOGIN_MUTATION = gql`
  mutation ($loginUser: UserInput) {
    login(user: $loginUser) {
      user {
        createdat
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
