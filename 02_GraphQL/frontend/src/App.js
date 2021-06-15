import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useQuery,
  gql,
} from "@apollo/client";
import { Form, Book } from "./components";
import { useState } from "react";

import "./App.css";
function App() {
  const [category, setCategory] = useState("book");
  const [action, setAction] = useState("find");
  const [results, setResults] = useState([]);
  return (
    <div className="app">
      <h1>Books System</h1>

      <div className="app__form">
        <h1>
          {action.charAt(0).toUpperCase() + action.slice(1)} on{" "}
          {category.charAt(0).toUpperCase() + category.slice(1)}(s)
        </h1>
        <p>
          Select Action
          <select value={action} onChange={(e) => setAction(e.target.value)}>
            <option value="add"> Add</option>
            <option value="delete">Delete</option>
            <option value="update">Update</option>
            <option value="find">Find</option>
          </select>
        </p>
        <p>
          Working with
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="book">Book</option>
            <option value="author">Author</option>
          </select>
        </p>
        <Form setResults={setResults} />
      </div>

      <h1>Results</h1>
      <div className="app__results">
        <Book />
      </div>
    </div>
  );
}

export default App;
