import { gql } from "@apollo/client";
const REQUEST_RESET_PASSWORD_MUTATION = gql`
  mutation ($sendEmailEmail: String!) {
    sendEmail(email: $sendEmailEmail) {
      error {
        message
        name
      }
      message
    }
  }
`;
export default REQUEST_RESET_PASSWORD_MUTATION;
