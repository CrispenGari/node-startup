import { gql } from "@apollo/client";
const REGISTER_MUTATION = gql`
  mutation ($registerUser: UserInput) {
    register(user: $registerUser) {
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
export default REGISTER_MUTATION;
