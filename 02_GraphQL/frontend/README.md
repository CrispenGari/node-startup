### Apollo and React.js

In this readme we are going to walk though on how to setup Apollo for a react app.

### Installation.

```
npm install @apollo/client graphql
```

**OR**

```
yarn add @apollo/client && yarn add graphql
```

### Imports

```js
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  gql,
} from "@apollo/client";
```

### Initialize ApolloClient

```js
const client = new ApolloClient({
  uri: "http://localhost:3001/graphql",
  cache: new InMemoryCache(),
});
```

### Making a query.

```js
client
  .query({
    query: gql`
      query GetRates {
        rates(currency: "USD") {
          currency
        }
      }
    `,
  })
  .then((result) => console.log(result));
```

### Connecting React Application to Appollo Client.

This is simple and well explained in the docs. All we need to do is to wrap our application using `ApolloProvider`. Which will give us access to the client throughout the application. We wrap the application as follows:

```js
function App() {
  return (
    <div>
      <h2>My first Apollo app </h2>
    </div>
  );
}

render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById("root")
);
```

We are going to show how we can perform the following actions in graphql.

1. Add an new book to the backend database
2. An a new Author to the backend database
3. Delete Books
4. Delete Authors
5. Update books
6. Update Authors
7. Getting books
8. **etc**.

### Making a queries.

### Creating an apollo client and wrap our app.

We are going to do this in th `index.js`

```js
import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ApolloProvider } from "@apollo/client";
const client = new ApolloClient({
  uri: "http://localhost:3001/graphql",
  cache: new InMemoryCache(),
});
ReactDOM.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
reportWebVitals();
```

### Getting all books.

To get all the books we can do it as follows:

```js
import React, { useState } from "react";
import { gql, useQuery } from "@apollo/client";
import "./index.css";
const allBooks = gql`
  {
    books {
      name
      author {
        id
      }
      authorId
    }
  }
`;
const Index = ({ setResults }) => {
  const [id, setId] = useState("");
  const { loading, data } = useQuery(allBooks);
  const findBook = (e) => {
    e.preventDefault();
    console.log(data);
  };
  return (
    <form className="form">
      <input type="text" value={id} onChange={(e) => setId(e.target.value)} />
      <button onClick={findBook}>Find</button>
    </form>
  );
};
export default Index;
```

- When the button is clicked we will be able to get all the books.

### Getting all authors.

```js
import React, { useState, useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import "./index.css";

const Index = ({ setResults }) => {
  const [id, setId] = useState("");
  const allAuthors = gql`
    {
      authors {
        name
        id
      }
    }
  `;
  const { loading, data } = useQuery(allAuthors);

  const findBook = (e) => {
    e.preventDefault();
    console.log(data);
  };
  return (
    <form className="form">
      <input type="text" value={id} onChange={(e) => setId(e.target.value)} />
      <button onClick={findBook}>Find</button>
    </form>
  );
};

export default Index;
```

### Getting a specific author and his books.

```js
import React, { useState, useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import "./index.css";

const Index = ({ setResults }) => {
  const [id, setId] = useState("");
  const query = gql`
    {
      author(id: "60c115b7bd6f7127f07d6993") {
        name
        books {
          name
        }
      }
    }
  `;
  const { loading, data } = useQuery(query);

  const findBook = (e) => {
    e.preventDefault();
    console.log(data);
  };
  return (
    <form className="form">
      <input type="text" value={id} onChange={(e) => setId(e.target.value)} />
      <button onClick={findBook}>Find</button>
    </form>
  );
};

export default Index;
```

### Mutations

1. Deleting

Deleting a book.

```js

```

2. Updating

Updating a book

```js

```

3. Adding a book.

```js

```

- Read more in the [Docs](https://www.apollographql.com/docs/react/get-started/)
