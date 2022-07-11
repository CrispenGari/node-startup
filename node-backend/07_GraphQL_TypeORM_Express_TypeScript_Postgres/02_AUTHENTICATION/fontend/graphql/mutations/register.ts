import { gql } from "@apollo/client";
const REGISTER_MUTATION = gql`
  mutation ($registerUser: UserInput) {
    register(user: $registerUser) {
      error {
        message
        name
      }
      user {
        createdat
        email
        username
        id
      }
    }
  }
`;
export default REGISTER_MUTATION;
