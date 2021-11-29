import React from "react";
import { useSocketIO } from "../providers/SocketIOProvider";

const Home = () => {
  const socket = useSocketIO();

  const [data, setData] = React.useState();

  React.useEffect(() => {
    if (socket) {
      // socket.emit("server", {
      //   message: "Hello, server",
      // });
      socket.on("connected", (args) => {
        console.log(args);
      });
      socket.on("someone-joined", (args) => setData(args));
    }
  }, [socket]);

  console.log(data);
  return (
    <div>
      <h1>Welcome to socket.io</h1>

      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default Home;
