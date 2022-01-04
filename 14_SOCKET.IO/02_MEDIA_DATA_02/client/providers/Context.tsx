import React from "react";
import { io } from "socket.io-client";
export const SocketContext = React.createContext({});

const socket = io("http://localhost:3001");

export const ContextProvider: React.FC<{}> = ({ children }) => {
  const [peer, setPeer] = React.useState<any>(null);
  React.useEffect(() => {
    let mounted: boolean = true;
    if (mounted && typeof navigator !== "undefined") {
      (async () => {
        const Peer = (await import("peerjs")).default;
        const peer = new Peer(undefined, {
          port: 3002,
          host: "/",
        });
        setPeer(peer);
      })();
    }
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        peer,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
