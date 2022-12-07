import { gql } from "@apollo/client";
const REGISTER_MUTATION = gql`
  mutation Register($input: UserInput!) {
    register(input: $input) {
      error {
        message
        field
      }
      user {
        username
        email
        id
      }
    }
  }
`;
export default REGISTER_MUTATION;
