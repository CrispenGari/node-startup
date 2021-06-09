import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useQuery,
  gql,
} from "@apollo/client";

const client = new ApolloClient({
  uri: "http://localhost:3001/graphql",
  cache: new InMemoryCache(),
});
function App() {
  client
    .query({
      query: gql`
        {
          books {
            name
            id
            author {
              name
            }
          }
        }
      `,
    })
    .then((result) => console.log(result.data));
  return (
    <div className="App">
      <h1> ApolloClient</h1>
    </div>
  );
}

export default App;
