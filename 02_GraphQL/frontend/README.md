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

- Read more in the [Docs](https://www.apollographql.com/docs/react/get-started/)
