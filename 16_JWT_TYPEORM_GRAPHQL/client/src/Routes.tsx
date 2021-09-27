import React from "react";

import Home from "./pages/Homes";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Register from "./pages/Homes";
import Login from "./pages/Login";
const Routes: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route path="/register" component={Register} />
        <Route path="/login" component={Login} />
        <Route path="/" component={Home} />
      </Switch>
    </Router>
  );
};

export default Routes;
