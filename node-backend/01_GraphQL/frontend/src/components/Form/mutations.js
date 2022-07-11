import { gql } from "@apollo/client";

const UPDATE_BOOK_MUTATION = gql`
  mutation updateBook($id: ID, $name: String!) {
    updateBook(id: $id, name: $name) {
      name
      id
    }
  }
`;

const ADD_BOOK_MUTATION = gql`
  mutation AddBook($authorId: ID, $name: String!) {
    addBook(authorId: $authorId, name: $name) {
      name
      id
    }
  }
`;

const DELETE_BOOK_MUTATION = gql`
  mutation DeleteBook($id: ID) {
    deleteBook(id: $id) {
      id
    }
  }
`;

export { ADD_BOOK_MUTATION, DELETE_BOOK_MUTATION, UPDATE_BOOK_MUTATION };
