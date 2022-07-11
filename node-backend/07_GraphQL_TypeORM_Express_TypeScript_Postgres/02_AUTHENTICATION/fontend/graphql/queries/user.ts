import { gql } from "@apollo/client";
export const USER_QUERY = gql`
  query user {
    user {
      username
      createdat
      email
      id
    }
  }
`;
export default USER_QUERY;
