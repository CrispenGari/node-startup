import React, { useEffect, useRef } from "react";
import { useMutation, gql } from "@apollo/client";
import {
  ADD_BOOK_MUTATION,
  DELETE_BOOK_MUTATION,
  UPDATE_BOOK_MUTATION,
} from "./mutations";

const ALL_BOOKS = gql`
  {
    books {
      name
      id
    }
  }
`;
const Index = () => {
  const [updateBook, { data, error }] = useMutation(UPDATE_BOOK_MUTATION, {
    refetchQueries: [{ query: ALL_BOOKS }],
  });
  const idRef = useRef(null);
  const nameRef = useRef(null);
  useEffect(() => {
    if (error) {
      console.error(error);
    } else {
      console.log(data);
    }
  }, [data, error]);
  const updateBookHandler = (e) => {
    e.preventDefault();
    updateBook({
      variables: {
        id: idRef.current.value,
        name: nameRef.current.value,
      },
    });
  };
  return (
    <>
      <form className="form">
        <h1>Add Book</h1>
        <input ref={idRef} type="text" placeholder="book id" />
        <input ref={nameRef} type="text" placeholder="book name" />
        <button onClick={updateBookHandler}>updateBook</button>
      </form>
    </>
  );
};
export default Index;
