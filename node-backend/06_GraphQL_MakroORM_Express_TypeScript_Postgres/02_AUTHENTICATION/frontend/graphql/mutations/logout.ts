import { gql } from "@apollo/client";
const LOGOUT_MUTATION = gql`
  mutation {
    logout
  }
`;
export default LOGOUT_MUTATION;
