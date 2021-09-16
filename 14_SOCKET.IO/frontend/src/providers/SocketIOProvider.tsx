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
}> = ({ children, username }) => {
  const [socket, setSocket] = React.useState<SocketType>();
  React.useEffect(() => {
    const client = io("http://localhost:3001/", {
      query: {
        id: username,
      },
    });
    setSocket(client);
    return () => {
      client.close();
    };
  }, [username]);

  return (
    <GlobalContext.Provider value={socket}>{children}</GlobalContext.Provider>
  );
};
