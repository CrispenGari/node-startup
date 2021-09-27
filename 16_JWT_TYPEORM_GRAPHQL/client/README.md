### Authentication using jwt (Frontend)

This is the frontend application that is going to comunicate with our server which is on port 3001. This application was bootstrapped using the following commands

1. Clone the repository

```shell
git clone https://github.com/CrispenGari/react-typescript-sass.git
```

2. Changing directory to `react-typescript-sass`

```shell
react-typescript-sass
```

3. Finally

```shell
npm install
#  Or
yarn
```

### Installation of packages

1. react-router-dom

```shell
yarn add react-router-dom && yarn add @types/react-router-dom
```

2. jwt-decode
   Helps us to decode jwt tokens

```shell
yarn add jwt-decode
```

3. apollo-boost, graphql, @apollo/client and react-apollo

```shell
yarn add apollo-boost graphql react-apollo @apollo/client && yarn add -D @types/graphql
```

4. GraphQL code generator

First we need to install teh CLI as a dev dependence but you can also install it globally but it is not recommended [docs](https://www.graphql-code-generator.com/docs/getting-started/installation)

```shell
yarn add -D @graphql-codegen/cli
```

Initialization

- Run the following command to initialize the code generator and answer some questions

```ts
yarn graphql-codegen init
```

Next we are going to go to the `codegen.yml` file and edit it to look as follows:

```yml
overwrite: true
schema: "http://localhost:3001/graphql"
documents: "src/graphql/**/*.graphql"
generates:
  src/generated/graphql.tsx:
    plugins:
      - "typescript"
      - "typescript-operations"
      - "typescript-react-apollo"
    config:
      withHOC: false
      withComponent: false
      withHooks: true
```

Then run the following command to install added packages:

```shell
yarn
```

We have configured our graphql code generator next whenever we create a query or a mutation we just run the following command:

```shell
yarn gen
```

### Creating the apolloClient.

We are going to create a folder called `providers`. This folder will wrap our application with all the providers that we are going to create. The first provider that we are going to have is the ApolloProvider which accepts a client as it's prop.

The provider will look as follows, `ApolloGraphQLProvider` will look as follows:

```tsx
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloLink, Observable } from "apollo-link";
import { ApolloProvider } from "@apollo/react-hooks";
import { HttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";
import { TokenRefreshLink } from "apollo-link-token-refresh";
import jwtDecode from "jwt-decode";

const cache = new InMemoryCache({});
const requestLink = new ApolloLink(
  (operation, forward) =>
    new Observable((observer) => {
      let handle: any;
      Promise.resolve(operation)
        .then((operation) => {
          const accessToken = getAccessToken();
          if (accessToken) {
            operation.setContext({
              headers: {
                authorization: `Bearer ${accessToken}`,
              },
            });
          }
        })
        .then(() => {
          handle = forward(operation).subscribe({
            next: observer.next.bind(observer),
            error: observer.error.bind(observer),
            complete: observer.complete.bind(observer),
          });
        })
        .catch(observer.error.bind(observer));

      return () => {
        if (handle) handle.unsubscribe();
      };
    })
);

const refreshLink: any = new TokenRefreshLink({
  accessTokenField: "accessToken",
  isTokenValidOrUndefined: () => {
    const token = getAccessToken();
    if (!token) {
      return true;
    }
    try {
      const { exp }: any = jwtDecode(token);

      if (Date.now() >= exp * 1000) {
        return false;
      } else {
        return true;
      }
    } catch {
      return false;
    }
  },
  fetchAccessToken: () => {
    return fetch("http://localhost:3001/refresh-token", {
      method: "POST",
      credentials: "include",
    });
  },
  handleFetch: (accessToken) => {
    setAccessToken(accessToken);
  },
  handleError: (err) => {
    console.warn("invalid token try to login again");
    console.error(err);
  },
});
const client = new ApolloClient({
  link: ApolloLink.from([
    refreshLink,
    onError(({ graphQLErrors, networkError }) => {
      console.log(graphQLErrors);
      console.log(networkError);
    }),
    requestLink,
    new HttpLink({
      uri: "http://localhost:3001/graphql",
      credentials: "include",
    }),
  ]),
  cache,
});

export const ApolloGraphQLProvider: React.FC = ({ children }) => {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
```

WE are going to wrap our application using the Provider we have just created in the index.tsx as follows:

```tsx
import { ApolloGraphQLProvider } from "./providers/ApolloGraphQLProvider";

ReactDOM.render(
  <ApolloGraphQLProvider>
    <App />
  </ApolloGraphQLProvider>,
  document.getElementById("root")
);
```

### Creating routes
