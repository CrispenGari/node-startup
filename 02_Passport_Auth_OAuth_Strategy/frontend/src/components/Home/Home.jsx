import React from "react";
import "./Home.css";
import Axios from "axios";
const Home = ({ user }) => {
  const logout = () => {
    (async () => {
      await Axios({
        method: "GET",
        // withCredentials: true,
        url: "http://localhost:3001/logout",
      });
    })();
  };
  return (
    <div className="home">
      <h1>Hello, {user.username}</h1>
      <button onClick={logout}>Logout</button>
      <h1>{user.provider}</h1>
    </div>
  );
};

export default Home;
