import React from "react";
import "./App.scss";
import { SocketIOProvider } from "./providers/SocketIOProvider";
import Home from "./app/Home";
const App: React.FC<{}> = () => {
  const [username, setUsername] = React.useState("");
  const [value, setValue] = React.useState("");
  const [room, setRoom] = React.useState("");
  if (username === "") {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setUsername(value);
        }}
      >
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          type="text"
          placeholder="enter your username"
        />

        <input
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          type="text"
          placeholder="a room..."
        />
        <button type="submit">join</button>
      </form>
    );
  }
  return (
    <SocketIOProvider username={username} room={room}>
      <Home />
    </SocketIOProvider>
  );
};

export default App;
