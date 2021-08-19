import { gql } from "@apollo/client";
const RESET_PASSWORD_MUTATION = gql`
  mutation ($resetPasswordEmailInput: ResetInput!) {
    resetPassword(emailInput: $resetPasswordEmailInput) {
      error {
        message
        name
      }
      user {
        email
        createdat
        username
        id
      }
    }
  }
`;
export default RESET_PASSWORD_MUTATION;
