import React from "react";
import { client } from "./grpc";
import { HelloRequest } from "./proto/hello_pb";

interface Props {}
const App: React.FC<Props> = () => {
  const [message, setMessage] = React.useState("");
  const [data, setData] = React.useState<any>();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const helloReq = new HelloRequest();
    helloReq.setMessage(message);
    const res = await client.hello(helloReq, {});
    setData(res.toObject());
  };
  return (
    <div className="App">
      <pre>
        <code>{JSON.stringify({ data }, null, 2)}</code>
      </pre>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="message..."
          onChange={(e) => setMessage(e.target.value)}
          value={message}
        />
        <button type="submit">SEND</button>
      </form>
    </div>
  );
};

export default App;
