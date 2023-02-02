import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import React, { useState } from "react";

interface Props {}

const Home: React.FC<Props> = ({}) => {
  const [roomId, setRoomId] = useState("");
  const [name, setName] = useState("");
  const router = useRouter();

  const joinRoom = () => {
    router.replace(`/room/${roomId}?name=${name}`);
  };
  return (
    <div className="index">
      <input
        type="text"
        placeholder="roomId"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />
      <br />
      <input
        type="text"
        placeholder="John"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <br />
      <button onClick={joinRoom}>JOIN ROOM</button>
    </div>
  );
};

export default Home;
