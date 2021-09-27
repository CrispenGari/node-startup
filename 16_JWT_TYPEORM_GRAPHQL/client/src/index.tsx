import * as React from "react";
import ReactDOM from "react-dom";
import "./index.scss";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ApolloGraphQLProvider } from "./providers/ApolloGraphQLProvider";

ReactDOM.render(
  <ApolloGraphQLProvider>
    <App />
  </ApolloGraphQLProvider>,
  document.getElementById("root")
);
reportWebVitals();
