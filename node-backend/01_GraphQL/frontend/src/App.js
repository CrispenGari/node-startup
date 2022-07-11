import { useQuery, gql } from "@apollo/client";
import { Form } from "./components";
import { useEffect, useState } from "react";

import "./App.css";
import { ApolloProvider, InMemoryCache, ApolloClient } from "@apollo/client";
const client = new ApolloClient({
  uri: "http://localhost:3001/graphql",
  cache: new InMemoryCache(),
});
const ALL_BOOKS = gql`
  {
    books {
      name
      id
    }
  }
`;

const UPDATE_BOOK = gql`
  mutation {
    updateBook(id: "60c8e6ba0fd6000f546a5c1f", name: "TensorFlow 2.0") {
      name
      id
    }
  }
`;
function App() {
  const { data, error, loading } = useQuery(ALL_BOOKS);
  useEffect(() => {
    console.log(data);
  }, [data]);

  const mutate = () => {
    client.mutate({
      mutation: UPDATE_BOOK,
    });
  };
  return (
    <div className="app">
      <h1>Books System</h1>
      <Form />

      <button onClick={mutate}>Mutate</button>
    </div>
  );
}

export default App;
