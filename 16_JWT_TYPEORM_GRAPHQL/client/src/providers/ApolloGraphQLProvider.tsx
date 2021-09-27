// import { ApolloLink, Observable } from "apollo-link";
import { onError } from "apollo-link-error";
import { TokenRefreshLink } from "apollo-link-token-refresh";
import jwtDecode, { JwtPayload } from "jwt-decode";
import { getAccessToken, setAccessToken } from "../state";

import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  HttpLink,
} from "@apollo/client";
import { ApolloLink, Observable } from "apollo-link";
const cache = new InMemoryCache();
const requestLink = new ApolloLink(
  (operation, forward) =>
    new Observable((observer) => {
      let handle: any;
      Promise.resolve(operation)
        .then((operation) => {
          const accessToken = getAccessToken();
          if (accessToken) {
            operation.setContext({
              credentials: "include",
              fetchOptions: {
                credentials: "include",
              },
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

const refreshLink = new TokenRefreshLink({
  accessTokenField: "accessToken",
  isTokenValidOrUndefined: () => {
    const token = getAccessToken();
    if (!token) {
      return true;
    }
    try {
      console.log("decoded", jwtDecode<JwtPayload>(token));
      const { exp }: any = jwtDecode<JwtPayload>(token);
      console.log(exp);
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
    console.log("fetching token.....");
    return fetch("http://localhost:3001/refresh-token", {
      method: "POST",
      credentials: "include",
    });
  },
  handleFetch: (accessToken) => {
    console.log("acess token", accessToken);
    setAccessToken(accessToken);
  },
  handleError: (err) => {
    console.warn("invalid token try to login again");
    console.error(err);
  },
});
const client = new ApolloClient({
  link: ApolloLink.from([
    refreshLink as any,
    onError(({ graphQLErrors, networkError }) => {
      console.log(graphQLErrors);
      console.log(networkError);
    }),
    requestLink,
    new HttpLink({
      uri: "http://localhost:3001/graphql",
      credentials: "include",
    }),
  ]) as any,
  cache: new InMemoryCache({}),
});

export const ApolloGraphQLProvider: React.FC = ({ children }) => {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
