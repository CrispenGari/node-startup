import { gql } from "@apollo/client";
const RESET_PASSWORD_MUTATION = gql`
  mutation ($resetPasswordEmailInput: ResetInput!) {
    resetPassword(emailInput: $resetPasswordEmailInput) {
      error {
        message
        name
      }
      user {
        createdat
        email
        id
        username
      }
    }
  }
`;
export default RESET_PASSWORD_MUTATION;
