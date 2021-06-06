import { useState } from "react";
import Axios from "axios";
import "./App.css";

function App() {
  const [usernameLogin, setUsernameLogin] = useState("");
  const [usernameRegister, setUsernameRegister] = useState("");
  const [passwordLogin, setPasswordLogin] = useState("");
  const [passwordRegister, setPasswordRegister] = useState("");
  const [messageRegister, setMessageRegister] = useState("");
  const [messageLogin, setMessageLogin] = useState("");

  const [user, setUser] = useState({});
  const displayUser = () => {
    (async () =>
      await Axios({
        method: "GET",
        url: "http://localhost:3001/user",
        withCredentials: true,
      }).then((res) => {
        setUser(res.data);
        console.log(res);
      }))();
  };
  const login = (e) => {
    e.preventDefault();
    (async () =>
      await Axios({
        method: "POST",
        data: {
          username: usernameLogin,
          password: passwordLogin,
        },
        withCredentials: true,
        url: "http://localhost:3001/login",
      }).then((res) => {
        setMessageLogin(res.data);
        console.log(res);
      }))();
  };
  const register = (e) => {
    e.preventDefault();
    console.log("Registering user");
    (async () =>
      await Axios({
        method: "POST",
        data: {
          username: usernameRegister,
          password: passwordRegister,
        },
        withCredentials: true,
        url: "http://localhost:3001/register",
      }).then((res) => {
        console.log(res);
        setMessageRegister(res.data);
      }))();
  };
  return (
    <div className="app">
      <h1>Passport Local Auth</h1>
      <form className="app__login">
        <h1>Login</h1>
        <input
          type="text"
          placeholder="username"
          value={usernameLogin}
          onChange={(e) => setUsernameLogin(e.target.value)}
        />
        <input
          type="password"
          placeholder="password"
          value={passwordLogin}
          onChange={(e) => setPasswordLogin(e.target.value)}
        />
        <p>{messageLogin}</p>
        <button type="submit" onClick={login}>
          Login
        </button>
      </form>
      <form className="app__register">
        <h1>Register</h1>
        <input
          type="text"
          placeholder="username"
          value={usernameRegister}
          onChange={(e) => setUsernameRegister(e.target.value)}
        />
        <input
          type="password"
          placeholder="password"
          value={passwordRegister}
          onChange={(e) => setPasswordRegister(e.target.value)}
        />
        <p>{messageRegister}</p>
        <button type="submit" onClick={register}>
          Register
        </button>
      </form>

      <div className="app__user">
        <button onClick={displayUser}>User</button>
        <h1>{user?.username}</h1>
      </div>
    </div>
  );
}

export default App;
