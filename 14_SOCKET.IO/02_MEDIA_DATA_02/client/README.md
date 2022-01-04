### client

```shell
npm i -g peer

#
peerjs --port <port>
```

This is a client application created using `cna`. The client application will also be using typescript as a programming language.

### Installation of packages

We will need to install 2 packages

1. socket.io-client

```shell
yarn add socket.io-client &&  yarn add -D @types/socket.io-client
```

2. simple-peer

```shell
yarn add simple-peer && yarn add -D @types/simple-peer
```

### React Context

We are going to use `React Context` to manage the state among components. Inside the `provider/Context.tsx` we are going to have the following code in it.

```ts
import React from "react";
import { io } from "socket.io-client";
import Peer, { Instance, SignalData } from "simple-peer";

export const SocketContext = React.createContext({});

const socket = io("http://localhost:3001");

export const ContextProvider: React.FC<{}> = ({ children }) => {
  //   states
  const [accepted, setAccepted] = React.useState<boolean>(false);
  const [ended, setEnded] = React.useState<boolean>(false);
  const [stream, setStream] = React.useState(null);
  const [call, setCall] = React.useState<
    | {
        receiving: boolean;
        from: string;
        name?: string;
        signal: SignalData;
      }
    | any
  >({});
  const [name, setName] = React.useState("unknown");
  const [me, setMe] = React.useState("");
  const myVideo = React.useRef<any>(null);
  const userVideo = React.useRef<any>(null);
  const connectionRef = React.useRef<any>(null);
  //

  React.useEffect(() => {
    let mounted: boolean = true;

    if (mounted) {
      // get the media streams
      window.navigator.mediaDevices
        .getUserMedia({
          video: true,
          audio: true,
        })
        .then((stream) => {
          setStream(stream);
          myVideo.current.srcObject = stream;
        });
      // get the socket id of yourself
      socket.on("me", (id: string) => {
        setMe(id);
      });

      socket.on("call", ({ from, name, signal }: any) => {
        setCall({
          receiving: true,
          from,
          name,
          signal,
        });
      });
    }

    return () => {
      mounted = false;
    };
  }, []);
  // methods

  const answerCall = () => {
    setAccepted(true);
    const peer: Instance = new Peer({
      initiator: false, // i'm not calling
      stream: stream,
      trickle: false,
    });
    peer.on("signal", (data) => {
      socket.emit("answer", {
        signal: data,
        to: call.from,
      });
    });
    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });
    peer.signal(call.signal);
    connectionRef.current = peer;
  };

  const callUser = (id: string) => {
    const peer: Instance = new Peer({
      initiator: true, // i'm the one calling
      trickle: false,
      stream,
    });

    peer.on("signal", (data) => {
      socket.emit("call", {
        userToCall: id,
        signal: data,
        from: me,
        name,
      });
    });

    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });

    socket.on("accepted", (signal) => {
      setAccepted(true);
      peer.signal(signal);
    });
    connectionRef.current = peer;
  };

  const endCall = () => {
    setEnded(true);
    connectionRef.current.destroy();
    window.location.reload();
  };

  return (
    <SocketContext.Provider
      value={{
        endCall,
        callUser,
        call,
        userVideo,
        me,
        setName,
        name,
        stream,
        myVideo,
        answerCall,
        accepted,
        ended,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
```

### Refs

1. [simple-peer](https://github.com/feross/simple-peer)
2. [socket.io](https://socket.io/docs/v4/client-api/)
