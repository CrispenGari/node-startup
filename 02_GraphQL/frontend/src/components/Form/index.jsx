import React, { useState, useEffect } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import "./index.css";

const Index = ({ setResults }) => {
  const ADD_BOOK = gql`
    mutation AddBook($name: String!, $authorId: Number) {
      addBook(name: $name, authorId: $authorId) {
        name
      }
    }
  `;
  const [addTodo, { data }] = useMutation(ADD_BOOK);

  const run = (e) => {
    e.preventDefault();
    addTodo({
      variables: {
        name: "Introduction to Deep learning maths.",
        authorId: 4,
      },
    });
  };
  return (
    <form className="form">
      <button onClick={run}>Run</button>
    </form>
  );
};

export default Index;
