import React from "react";
import { trpc } from "./utils/trpc";

interface Props {}
const App: React.FC<Props> = () => {
  const { data, isFetched, isLoading } = trpc.hello.greeting.useQuery({
    name: " TRPC",
  });

  const { mutate } = trpc.notification.notify.useMutation();
  trpc.notification.onNotification.useSubscription(undefined, {
    onData(data) {
      console.log({ data });
    },
  });
  return (
    <div className="App">
      <pre>
        <code>{JSON.stringify({ data, isFetched, isLoading }, null, 2)}</code>
      </pre>
      <br />
      <button
        onClick={async () => {
          await mutate({
            message: "This is working",
          });
        }}
      >
        Send Notification
      </button>
    </div>
  );
};

export default App;
