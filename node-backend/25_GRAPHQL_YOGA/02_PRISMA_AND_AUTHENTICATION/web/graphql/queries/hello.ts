import { gql } from "@apollo/client";

export const HELLO_WORLD_QUERY = gql`
  query hello {
    hello
  }
`;
export default HELLO_WORLD_QUERY;
