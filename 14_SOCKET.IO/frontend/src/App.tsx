import React from "react";
import "./App.scss";
import { SocketIOProvider } from "./providers/SocketIOProvider";
import Home from "./app/Home";
const App: React.FC<{}> = () => {
  return (
    <SocketIOProvider username="crispen">
      <Home />
    </SocketIOProvider>
  );
};

export default App;
