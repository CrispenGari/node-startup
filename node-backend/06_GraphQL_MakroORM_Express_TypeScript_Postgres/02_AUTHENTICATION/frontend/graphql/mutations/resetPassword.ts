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
        createdAt
        username
        id
      }
    }
  }
`;
export default RESET_PASSWORD_MUTATION;
