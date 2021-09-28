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

3. apollo-boost, graphql, @apollo/react-apollo

```shell
yarn add apollo-boost @apollo/react-hooks graphql && yarn add -D @types/graphql
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
// import { ApolloLink, Observable } from "apollo-link";
// import { onError } from "apollo-link-error";
// // import { TokenRefreshLink } from "apollo-link-token-refresh";
// // import jwtDecode, { JwtPayload } from "jwt-decode";
// import { getAccessToken, setAccessToken } from "../state";
// // import { ApolloProvider } from "@apollo/react-hooks";
// import {
//   ApolloClient,
//   InMemoryCache,
//   NormalizedCacheObject,
//   createHttpLink,
//   ApolloProvider,
// } from "@apollo/client";

// import { setContext } from "@apollo/client/link/context";
// const httpLink = createHttpLink({
//   uri: "http://localhost:3001/graphql",
//   credentials: "include",
// });

// const authLink = setContext((_, { headers }) => {
//   // get the authentication token from local storage if it exists
//   const token =
//     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxYjI3NmZhYS0yNmVjLTRkOGYtYTVkMS0zOTdmN2IwZjY0NDAiLCJ0b2tlblZlcnNpb24iOjAsImlhdCI6MTYzMjgxNTY0MywiZXhwIjoxNjMzNDIwNDQzfQ.Y9UZrfwPphc3XO4IjSzzUfRPqcVXMOHRjyeyMHCIpTM"; //getAccessToken();
//   // return the headers to the context so httpLink can read them
//   return {
//     headers: {
//       ...headers,
//       authorization: token ? `Bearer ${token}` : "",
//     },
//   };
// });

// const client = new ApolloClient({
//   uri: httpLink.concat(authLink) as any,
//   cache: new InMemoryCache(),

//   // request: async (operation) => {
//   //   const token = getAccessToken();
//   //   operation.setContext({
//   //     headers: {
//   //       authorization: token,
//   //     },
//   //   });
//   // },
//   // onError: ({ graphQLErrors, networkError }) => {
//   //   if (graphQLErrors) {
//   //     console.error(graphQLErrors);
//   //   }
//   //   if (networkError) {
//   //     console.log(networkError);
//   //   }
//   // },
// });
import { onError } from "apollo-link-error";
// import { ApolloLink, Observable } from "apollo-link";
import {
  ApolloProvider,
  InMemoryCache,
  HttpLink,
  ApolloClient,
  createHttpLink,
  ApolloLink,
  Observable,
} from "@apollo/client";
import { getAccessToken } from "../state";

const cache = new InMemoryCache({});
const requestLink = new ApolloLink(
  (operation, forward) =>
    new Observable((observer) => {
      let handle: any;
      Promise.resolve(operation)
        .then((operation) => {
          const accessToken = getAccessToken();
          if (accessToken) {
            console.log("setting the header");
            operation.setContext({
              headers: {
                authorization: `Bearer ${accessToken}`,
              },
            });
          } else {
            console.log("No access token");
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
const client = new ApolloClient({
  link: ApolloLink.from([
    requestLink,
    createHttpLink({
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

Before creating the routes we need to make sure we get the `refreshToken` and `accessToken` using the fetch api at `http://localhost:3001/fetch-token`. So inside our App.tsx we are going to fetch these tokens as follows before rendering the routes:

```ts
// App.tsx
import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { useUserQuery } from "./generated/graphql";
import Routes from "./Routes";
import { getAccessToken, setAccessToken } from "./state";

const App: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    fetch("http://localhost:3001/refresh-token", {
      method: "POST",
      credentials: "include",
    })
      .then(async (res) => {
        const { accessToken } = await res.json();
        setAccessToken(accessToken);
      })
      .catch((error) => console.log(error))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <p>loading...</p>
      </div>
    );
  }
  return <Routes />;
};
```

So we are setting the `AccessToken` to the global variable using the `setAccessToken` where we can get it through out the app using `getAccessToken`. These are function that are in the `state/index.ts` and they look as follows:

```ts
let accessToken: string = "";
export const setAccessToken = (token: string): void => {
  accessToken = token;
};
export const getAccessToken = (): string => {
  return accessToken;
};
```

Next we are going to create our routes. We are going to use the `react-router-dom` inside the `Routes.tsx` file and it looks as follows:

```tsx
import React from "react";
import Home from "./pages/Homes";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
const Routes: React.FC = () => {
  return (
    <Router>
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "grid",
          placeItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: 500,
          }}
        >
          <Link to="/">posts</Link>
          <div>
            <Link to="/register">register</Link> <Link to="/login">login</Link>
          </div>
        </div>
        <Switch>
          <Route path="/register" exact component={Register} />
          <Route path="/login" component={Login} />
          <Route path="/" exact component={Home} />
        </Switch>
      </div>
    </Router>
  );
};
export default Routes;
```

Now we will be able to navigate to different routes on our application. In the Home.tsx file we are going to try and fetch the post, which is a protected mutation using the `isAuth` middleware that check if we are authenticated or not using the browser cookie. This file looks as follows:

```tsx
import { usePostsQuery, useUserQuery } from "../generated/graphql";

const Register = () => {
  const { data } = useUserQuery();

  const { data: post } = usePostsQuery();
  return (
    <div>
      <div
        style={{
          width: 500,
          display: "flex",
          padding: 10,
          background: "black",
          color: "white",
          justifyContent: "space-between",
        }}
      >
        <p>{data?.user?.email}</p>
        <button>logout</button>
      </div>

      <div>
        {post?.posts ? (
          post?.posts.map((p: any, _: number) => (
            <p key={p.id.toString()}>{p.caption}</p>
          ))
        ) : (
          <p>Not authenticated</p>
        )}
      </div>
    </div>
  );
};

export default Register;
```

Again we are using graphql code generator so for all these hooks like `usePosts` they are generated automatically by running the command:

```shell
yarn gen
```

So the graphql code generator will look at graphql files that are in the `graphql` folder for example inside the `graphql` folder we have a `post.graphql` file which contains a query for post which looks as follows:

```gql
query Posts {
  posts {
    id
    caption
  }
  user {
    userId
    email
  }
}
```

> Now if we are authenticated, even if we refresh the page we will remain authenticated. Next we are going to implement the logout button.

### Logout.

Again all the magic happens behind the scenes in the backend, in the frontend we are only using graphql queries and mutations. so we are going to create a file called `logout.graphql` which looks as follows inside the `graphql` folder.

```gql
mutation Logout {
  logout
}
```

Then run the following shell command

```
yarn gen
```

Inside the Home.tsx file we are going to use the `useLogout` hook which will be generated to log out the user as follows:

```tsx
const [logout] = useLogoutMutation();
...
<button
    onClick={() => {
            logout();

          }}
        >
    logout
</button>
```

If we go to the backend inside the `src` folder there's a folder called `auth`. In this folder we have a file called `index.ts`. In this file that's where we handle the creation of acccess tokens. The function that create tokens looks as follows:

```ts
export const createAccessToken = (user: User): string => {
  return jwt.sign(
    {
      userId: user.userId,
      tokenVersion: user.tokenVersion,
    },
    process.env.ACCESS_TOKEN_SECRETE!,
    {
      expiresIn: "10m",
    }
  );
};
```

The token expires in `10` min, so after 10 minutes the user have to login again. To avoid this behaviour we need to refresh the token in the background without the user knowing that their token has been refreshed. That's where the [`apollo-link-token-refresh`](https://github.com/newsiberian/apollo-link-token-refresh) comes in. We need to create a new link let's call it `tokenLink` this link has to be the first link on the list in our `ApolloLink.from()` function and it looks as follows:

```ts
const tokenLink = new TokenRefreshLink({
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
  handleFetch: (accessToken: string) => {
    setAccessToken(accessToken);
  },
  handleError: (err: any) => {
    console.warn("your refresh token is invalid. Try to relogin");
    console.error(err);
  },
});
```

We are using the `jwt-decode` to decode `jwt` tokens to objects. So what this does is to check if the token has expired or not. If it has expired without the user knowing we will refresh the token.
