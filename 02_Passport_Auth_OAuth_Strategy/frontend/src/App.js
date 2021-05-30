import { useEffect, useState } from "react";
import "./App.css";
import Home from "./components/Home/Home";
import Login from "./components/Login";
import Axios from "axios";

function App() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    (async () => {
      await Axios({
        method: "GET",
        url: "http://localhost:3001/user",
        withCredentials: true,
      }).then((res) => {
        console.log(res.data);
        setUser(res.data);
      });
    })();
  }, []);
  return <div className="app">{user ? <Home user={user} /> : <Login />}</div>;
}

export default App;
