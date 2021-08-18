import { gql } from "@apollo/client";
const REQUEST_RESET_PASSWORD_MUTATION = gql`
  mutation ($email: String!) {
    sendEmail(email: $email) {
      message
      error {
        name
        message
      }
    }
  }
`;
export default REQUEST_RESET_PASSWORD_MUTATION;
