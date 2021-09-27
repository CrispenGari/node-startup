import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { useUserQuery } from "./generated/graphql";
import Routes from "./Routes";
import { setAccessToken } from "./state";

const App: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  const { data } = useUserQuery({ fetchPolicy: "cache-and-network" });
  React.useEffect(() => {
    fetch("http://localhost:3001/refresh-token", {
      method: "POST",
      credentials: "include",
      headers: {
        authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxYjI3NmZhYS0yNmVjLTRkOGYtYTVkMS0zOTdmN2IwZjY0NDAiLCJ0b2tlblZlcnNpb24iOjAsImlhdCI6MTYzMjc2ODA3OSwiZXhwIjoxNjMzMzcyODc5fQ.igF-pzxHPdg2BIjLIkTbxjlZzBtaFeTSaqOzTKCZAEM`,
      },
    })
      .then((res) => console.log(res))
      .catch((error) => console.log(error))
      .finally(() => setLoading(false));
    // .then(async (response) => {
    //   // console.log(response);
    //   console.log(response);
    //   setAccessToken("");
    //   setLoading(false);
    // })
    // .catch((err) => setLoading(false));
  }, []);

  console.log(data, loading);

  if (loading) {
    return (
      <div>
        <p>loading...</p>
      </div>
    );
  }

  return <Routes />;
};

export default App;
