import "../styles/globals.css";

import { ApolloProvider } from "@apollo/client";
import { useApollo } from "../lib/apolloClient";
const App = ({ Component, pageProps }) => {
  const client = useApollo(pageProps.initialApolloState);

  return (
    <ApolloProvider client={client}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
};

export default App;
