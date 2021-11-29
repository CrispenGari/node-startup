import React from "react";
import { ContextType } from "../../types";
import { SocketContext } from "../../providers/Context";

import styles from "./Notification.module.css";
const Notification = () => {
  const { call, answerCall }: ContextType = React.useContext(SocketContext);
  return (
    <div className={styles.notification}>
      <h1>{call.name} is calling</h1>
      <button onClick={answerCall}>answer</button>
    </div>
  );
};

export default Notification;
