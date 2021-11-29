import React from "react";
import { SocketContext } from "../../providers/Context";
import { ContextType } from "../../types";
import styles from "./Video.module.css";
const Video = () => {
  const { accepted, ended, name, stream, myVideo, userVideo }: ContextType =
    React.useContext(SocketContext);
  console.log(name);
  return (
    <div className={styles.videos}>
      {/* my video*/}
      {stream && (
        <div className={styles.video}>
          <h1>{name}</h1>
          <video playsInline muted ref={myVideo} autoPlay></video>
        </div>
      )}
      {/* user video */}
      {accepted && !ended && (
        <div className={styles.video}>
          <h1>{name}</h1>
          <video playsInline muted={false} ref={userVideo} autoPlay></video>
        </div>
      )}
    </div>
  );
};

export default Video;
