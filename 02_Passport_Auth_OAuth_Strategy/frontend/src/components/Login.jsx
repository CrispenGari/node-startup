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
  return (
    <div className="login">
      <h1>Open Authentication</h1>
      <button onClick={googleLogin}>Google</button>
      <button>Facebook</button>
      <button onClick={twitterLogin}>Twitter</button>
      <button onClick={githubLogin}>Github</button>
    </div>
  );
};

export default Login;
