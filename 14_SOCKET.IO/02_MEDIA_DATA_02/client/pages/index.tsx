import styles from "../styles/Home.module.css";

import React from "react";
import { SocketContext } from "../providers/Context";
import { ContextType } from "../types";
import { useRouter } from "next/router";
import { v4 as uuid_v4 } from "uuid";

const Home = () => {
  const router = useRouter();

  const { socket, peer }: ContextType = React.useContext(SocketContext);
  const [username, setUsername] = React.useState("");
  const [username1, setUsername1] = React.useState("");
  const [id, setId] = React.useState("");

  const joinMeeting = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!username || !id) {
      return;
    }
    // join to that room
    return router.push(`/room/${id}?username=${username}&host=false`);
  };

  const newMeeting = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!username1) {
      return;
    }
    const roomId: string = uuid_v4();
    let user = {
      id: uuid_v4(),
      username: username1.trim().toLowerCase(),
    };
    const data = {
      user,
      roomId,
    };
    // join to that room
    socket.emit("create-meeting", data);
    return router.replace(
      `/room/${roomId}?username=${username1}&host=true&userId=${user.id}`
    );
  };

  return (
    <div className={styles.container}>
      <form onSubmit={newMeeting}>
        <h1>create a new meeting</h1>
        <input
          value={username1}
          onChange={(e) => setUsername1(e.target.value)}
          type="text"
          placeholder="username"
        />
        <button type="submit">create new meeting</button>
      </form>

      <form onSubmit={joinMeeting}>
        <h1>join a meeting</h1>
        <input
          value={id}
          onChange={(e) => setId(e.target.value)}
          type="text"
          placeholder="meeting id"
        />
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          type="text"
          placeholder="username"
        />
        <button type="submit">join a meeting</button>
      </form>
    </div>
  );
};

export default Home;
