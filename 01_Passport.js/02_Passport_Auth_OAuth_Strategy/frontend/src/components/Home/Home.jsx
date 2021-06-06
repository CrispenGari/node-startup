import React from "react";
import "./Home.css";
import Axios from "axios";
const Home = ({ user }) => {
  const logout = () => {
    Axios.get("http://localhost:3001/auth/logout", {
      withCredentials: true,
    }).then((res) => {
      window.location = "http://localhost:3000";
    });
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
