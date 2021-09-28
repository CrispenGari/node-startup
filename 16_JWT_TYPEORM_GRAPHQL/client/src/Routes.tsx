import React from "react";

import Home from "./pages/Homes";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
const Routes: React.FC = () => {
  return (
    <Router>
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "grid",
          placeItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: 500,
          }}
        >
          <Link to="/">posts</Link>
          <div>
            <Link to="/register">register</Link> <Link to="/login">login</Link>
          </div>
        </div>
        <Switch>
          <Route path="/register" exact component={Register} />
          <Route path="/login" component={Login} />
          <Route path="/" exact component={Home} />
        </Switch>
      </div>
    </Router>
  );
};

export default Routes;
