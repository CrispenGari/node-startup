import React from "react";
import "./Login.css";
const Login = () => {
  const googleLogin = () => {
    window.open("http://localhost:3001/auth/google", "_self");
  };

  const githubLogin = () => {
    window.open("http://localhost:3001/auth/github", "_self");
  };

  const twitterLogin = () => {
    window.location.href = "http://localhost:3001/auth/twitter";
  };
  const facebookLogin = () => {
    window.open("http://localhost:3001/auth/facebook", "_self");
  };
  return (
    <div className="login">
      <h1>Open Authentication</h1>
      <button onClick={googleLogin}>Google</button>
      <button onClick={facebookLogin}>Facebook</button>
      <button onClick={twitterLogin}>Twitter</button>
      <button onClick={githubLogin}>Github</button>
    </div>
  );
};

export default Login;
