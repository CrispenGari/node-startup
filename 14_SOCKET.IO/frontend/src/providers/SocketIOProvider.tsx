import React from "react";
import io, { Socket } from "socket.io-client";
import { DefaultEventsMap } from "socket.io-client/build/typed-events";
type SocketType = Socket<DefaultEventsMap, DefaultEventsMap>;
export const GlobalContext = React.createContext<SocketType | undefined>(
  undefined
);
export const useSocketIO = () => {
  return React.useContext(GlobalContext);
};
export const SocketIOProvider: React.FC<{
  username: string;
  room?: string;
}> = ({ children, username, room }) => {
  const [socket, setSocket] = React.useState<SocketType>();
  React.useEffect(() => {
    const client = io("http://localhost:3001/", {
      query: {
        username: username,
        room: room!,
      },
    });
    setSocket(client);
    return () => {
      client.close();
    };
  }, [username, room]);

  socket?.on("user-disconnected", (res) => {
    console.log(res);
  });
  socket?.on("user-connected", (res) => {
    console.log(res);
  });
  socket?.emit("send-message", {
    message: "hello i'm " + username,
    room,
  });
  socket?.on("new-message", (res) => console.log(res));
  return (
    <GlobalContext.Provider value={socket}>{children}</GlobalContext.Provider>
  );
};
