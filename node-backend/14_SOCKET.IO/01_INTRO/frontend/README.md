### Socket.io Client

In we are going to intergrate this react application with node.js server that is listening on port 3001. This server is made up of express and socket.io

### Installation of socket.io-client

To install `socket.io-client` you run the following command:

```shell
yarn add socket.io-client
```

### Creating an `io` instance to our local server.

```ts
....
import io from "socket.io-client";
const App: React.FC<{}> = () => {
  React.useEffect(() => {
    const client = io("http://localhost:3001/", {
      query: {
        id: "45",
      },
    });
    console.log(client);
    return () => {
      client.close();
    };
  }, []);
...
};
export default App;
```

> The way i will handle this on the frontend is more professional feel free to use basic implementation if you want. The idea is to build a project in the future that uses socket.io on the server and client, so what i'm going to do next is to create a `Socket.io` Provider. The reason being the `socket` object will be used throughout the entire application, so it will be easy to pull it down from the global context rather than passing down from parent to children as props, which may lead to prop drilling, which is what a pro doesn't want.

### The `SocketIOProvider`.

```ts
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
    console.log(socket);
    return () => {
      client.close();
    };
  }, [username]);

  return (
    <GlobalContext.Provider value={socket}>{children}</GlobalContext.Provider>
  );
};
```

Then we wrap the entire application with the provider as follows:

### `App.tsx`

```tsx
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
```

### `Home.tsx`

```tsx
import React from "react";
import { useSocketIO } from "../providers/SocketIOProvider";

const Home = () => {
  const socket = useSocketIO();
  console.log(socket);
  return (
    <div>
      <h1>Welcome to socket.io</h1>
    </div>
  );
};

export default Home;
```

Note that we are passing dow the `username` to our provider so that it will be sent to the server as a query variable.

### References

- [Socket.io Client](https://socket.io/docs/v4/client-initialization/)
