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

**mutation.js**

```js
import { gql } from "@apollo/client";
const DELETE_BOOK_MUTATION = gql`
  mutation DeleteBook($id: ID) {
    deleteBook(id: $id) {
      id
    }
  }
`;
export { DELETE_BOOK_MUTATION };
```

> When creating a mutation note that `$id` is of type `ID` which is very important in the client. Though on the backend we set it to be `Integer.`

Deleting a book when the button is clicked.

**Form/index.jsx**

```jsx
import React, { useEffect, useRef } from "react";
import { useMutation } from "@apollo/client";
import { DELETE_BOOK_MUTATION } from "./mutations";
const Index = () => {
  const [deleteBook, {}] = useMutation(DELETE_BOOK_MUTATION);
  const deleteIdRef = useRef(null);
  const deleteBookHandler = (e) => {
    e.preventDefault();
    deleteBook({
      variables: {
        id: deleteIdRef.current.value,
      },
    });
  };
  return (
    <>
      <form className="form">
        <h1>Delete Book</h1>
        <input ref={deleteIdRef} type="text" placeholder="book id" />
        <button onClick={deleteBookHandler}>deleteBook</button>
      </form>
    </>
  );
};
export default Index;
```

Now the book will be deleted. But it won't update books on the client side. So how can we update the books on the client on success delete. Well, we will use the `refetchQueries`.

##### `refetchQueries`

An array or function that allows you to specify which queries you want to refetch after a mutation has occurred. Array values can either be queries (with optional variables) or just the string names of queries to be refeteched.
So now we want to delete a book and print out the books that are available after a mutaion. **Note that this works even when updating, or adding a book** any mutation this works the same. We are only going to change the `Form/index.tsx` file.

```jsx
import React, { useEffect, useRef } from "react";
import { useMutation, gql } from "@apollo/client";
import { DELETE_BOOK_MUTATION } from "./mutations";

const ALL_BOOKS = gql`
  {
    books {
      name
      id
    }
  }
`;
const Index = () => {
  const [deleteBook, { data, error }] = useMutation(DELETE_BOOK_MUTATION, {
    refetchQueries: [{ query: ALL_BOOKS }],
  });

  useEffect(() => {
    if (error) {
      console.error(error);
    } else {
      console.log(data);
    }
  }, [data, error]);
  const deleteIdRef = useRef(null);
  const deleteBookHandler = (e) => {
    e.preventDefault();
    deleteBook({
      variables: {
        id: deleteIdRef.current.value,
      },
    });
  };
  return (
    <>
      <form className="form">
        <h1>Delete Book</h1>
        <input ref={deleteIdRef} type="text" placeholder="book id" />
        <button onClick={deleteBookHandler}>deleteBook</button>
      </form>
    </>
  );
};
export default Index;
```

### Credits

- [Blog Post](https://www.apollographql.com/blog/apollo-client/caching/when-to-use-refetch-queries/)

2. Updating

Mutation that update the book. `mutations.js`

```js
import { gql } from "@apollo/client";

const UPDATE_BOOK_MUTATION = gql`
  mutation updateBook($id: ID, $name: String!) {
    updateBook(id: $id, name: $name) {
      name
      id
    }
  }
`;

export { UPDATE_BOOK_MUTATION };
```

The full react code that updates a book.

```jsx
import React, { useEffect, useRef } from "react";
import { useMutation, gql } from "@apollo/client";
import { UPDATE_BOOK_MUTATION } from "./mutations";

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
```

3. Adding a book.

**Mutation for adding a new Book** - mutations.js

```js
import { gql } from "@apollo/client";
const ADD_BOOK_MUTATION = gql`
  mutation AddBook($authorId: ID, $name: String!) {
    addBook(authorId: $authorId, name: $name) {
      name
      id
    }
  }
`;
export { ADD_BOOK_MUTATION };
```

Code that help us to add a new book.

```jsx
import React, { useEffect, useRef } from "react";
import { useMutation, gql } from "@apollo/client";
import { ADD_BOOK_MUTATION, DELETE_BOOK_MUTATION } from "./mutations";

const ALL_BOOKS = gql`
  {
    books {
      name
      id
    }
  }
`;
const Index = () => {
  const [addBook, { data, error }] = useMutation(ADD_BOOK_MUTATION, {
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
  const addBookHandler = (e) => {
    e.preventDefault();
    addBook({
      variables: {
        authorId: idRef.current.value,
        name: nameRef.current.value,
      },
    });
  };
  return (
    <>
      <form className="form">
        <h1>Add Book</h1>
        <input ref={idRef} type="number" placeholder="author id" />
        <input ref={nameRef} type="text" placeholder="book name" />
        <button onClick={addBookHandler}>addBook</button>
      </form>
    </>
  );
};
export default Index;
```

We will lastly look at the `client.mutate` function.

### `Client.mutate()`

This functions allows us to make mutations to the server by just calling it. The following code updates the book when a button `mutate` is clicked. This works the same with other mutation such as updating a, deleting ...

```jsx
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
      <button onClick={mutate}>Mutate</button>
    </div>
  );
}

export default App;
```

This function works the same as the `client.query()`.

- Read more in the [Docs](https://www.apollographql.com/docs/react/get-started/)
