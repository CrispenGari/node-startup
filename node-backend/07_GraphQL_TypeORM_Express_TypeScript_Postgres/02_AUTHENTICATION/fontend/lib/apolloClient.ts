import { useMemo } from "react";
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { uri, __ssrMode__ } from "./constants";
let client: ApolloClient<any>;

const createApolloClient = (): ApolloClient<any> => {
  return new ApolloClient({
    credentials: "include",
    ssrMode: __ssrMode__,
    link: new HttpLink({
      uri,
      credentials: "include",
    }),
    cache: new InMemoryCache(),
  });
};

export const initializeApollo = (initialState = null) => {
  const apolloClient = client ?? createApolloClient();
  if (initialState) {
    const cache = apolloClient.extract();
    apolloClient.cache.restore({
      ...cache,
      ...initialState,
    });
  }
  if (__ssrMode__) return apolloClient;
  if (!client) client = apolloClient;
  return apolloClient;
};

export const useApollo = (initialState) => {
  return useMemo(() => initializeApollo(initialState), [initialState]);
};
