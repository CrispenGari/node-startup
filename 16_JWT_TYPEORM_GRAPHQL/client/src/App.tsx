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

export default App;
