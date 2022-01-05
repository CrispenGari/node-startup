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
