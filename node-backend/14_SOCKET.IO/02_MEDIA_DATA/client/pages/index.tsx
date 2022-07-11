import styles from "../styles/Home.module.css";

import React from "react";
import { SocketContext } from "../providers/Context";
import Video from "../components/Video/Video";
import Notification from "../components/Notification/Notification";
import Option from "../components/Options/Option";
import { ContextType } from "../types";
const Home = () => {
  const { call, accepted }: ContextType = React.useContext(SocketContext);
  return (
    <div className={styles.container}>
      <h1>video chat</h1>
      <Video />
      <Option />
      {call.receiving && !accepted && <Notification />}
    </div>
  );
};

export default Home;
