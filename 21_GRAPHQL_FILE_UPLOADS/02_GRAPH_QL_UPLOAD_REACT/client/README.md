### Client

In this example we are going to show how we can upload files to the server using [apollo-upload-client](https://github.com/jaydenseric/apollo-upload-client). We have the graphql server that is running on `http://localhost:3001/graphql` and we want to make a query for all images in the server which looks as follows:

```
query{
  getFiles
}
```

And a mutation that upload a file to the server which looks as follows:

```
mutation UploadFile($picture: Upload!){
  uploadFile(picture: $picture)
}

```

### Setup

First we need to install the following packages

```shell
yarn add @apollo/client graphql apollo-upload-client

# apollo-upload-client types

yarn add -D @types/apollo-upload-client
```

Then we go to the `index.tsx` file and create an `ApolloClient` and wrap the application using `ApolloProvider` from `@apollo/client`

```tsx

...
import { createUploadLink } from "apollo-upload-client";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
const link = createUploadLink({ uri: "http://localhost:3001/graphql" });

const client = new ApolloClient({
  link,
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

> Note that we are creating the link from `apollo-upload-client` using the `createUploadLink` as follows:

```ts
const link = createUploadLink({ uri: "http://localhost:3001/graphql" });
```

> Now we are ready to make mutations and queries to the server. The code of doing that is found in the `App.tsx` and it looks as follows:

```tsx
import React from "react";
import "./App.css";
import { gql, useMutation, useQuery } from "@apollo/client";
const ALL_FILES_QUERY = gql`
  query {
    getFiles
  }
`;

const UPLOAD_MUTATION = gql`
  mutation UploadFile($picture: Upload!) {
    uploadFile(picture: $picture)
  }
`;
function App() {
  const { data, loading } = useQuery(ALL_FILES_QUERY);

  const [upload, { data: D }] = useMutation(UPLOAD_MUTATION, {
    refetchQueries: [
      {
        query: ALL_FILES_QUERY,
        fetchPolicy: "network-only",
      },
    ],
  });
  const [image, setImage] = React.useState<any>();

  if (loading) {
    return <p>loading</p>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImage({
      valid: e.target.validity.valid,
      image: (e.target as any)?.files[0],
    });
  };

  const postImage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (image?.valid) {
      await upload({
        variables: {
          picture: image.image,
        },
      });
    } else {
      return;
    }
    setImage(undefined);
  };

  console.log(D);
  return (
    <div className="app">
      <form onSubmit={postImage}>
        <input
          type="file"
          accept="images/*"
          multiple={false}
          onChange={handleChange}
        />

        {image ? (
          <button type="submit">UPLOAD</button>
        ) : (
          <p>Select an image to upload first.</p>
        )}
      </form>

      <div
        className="app__images
      "
      >
        <h1>Images on the server</h1>

        {data?.getFiles?.map((url: any) => (
          <img src={url} key={url} alt="/" />
        ))}
      </div>
    </div>
  );
}

export default App;
```

### Ref

1. [apollo-upload-client](https://github.com/jaydenseric/apollo-upload-client)
