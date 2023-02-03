import React from "react";
import { trpc } from "./utils/trpc";

interface Props {}
const App: React.FC<Props> = () => {
  const { data, isFetched, isLoading } = trpc.hello.useQuery({ name: " TRPC" });
  return (
    <div className="App">
      <pre>
        <code>{JSON.stringify({ data, isFetched, isLoading }, null, 2)}</code>
      </pre>
    </div>
  );
};

export default App;
