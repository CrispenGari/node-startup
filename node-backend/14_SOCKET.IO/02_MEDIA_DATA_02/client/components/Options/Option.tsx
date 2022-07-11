import React from "react";
import { SocketContext } from "../../providers/Context";
import { ContextType } from "../../types";

import styles from "./Options.module.css";
const Option = () => {
  const [meetingId, setMeetingId] = React.useState("");
  const { me, accepted, ended, endCall, callUser, setName, name }: ContextType =
    React.useContext(SocketContext);
  return (
    <div className={styles.options}>
      <h1>profile</h1>
      <p>meeting name</p>
      <input
        type="text"
        placeholder="meeting name..."
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <p>meeting id</p>
      <input type="text" value={me} readOnly />

      <h1>make a call</h1>
      <input
        type="text"
        placeholder="meeting id ..."
        value={meetingId}
        onChange={(e) => setMeetingId(e.target.value)}
      />
      {accepted && !ended ? (
        <button onClick={endCall}>hang up</button>
      ) : (
        <button onClick={() => callUser(meetingId)}>call</button>
      )}
    </div>
  );
};

export default Option;
