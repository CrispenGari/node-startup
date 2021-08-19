import { gql } from "@apollo/client";
export const USER_QUERY = gql`
  query user {
    user {
      username
      created_at
      email
      id
    }
  }
`;
export default USER_QUERY;
