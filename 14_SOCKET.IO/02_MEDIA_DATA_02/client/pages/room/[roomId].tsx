import React from "react";
import { useRouter } from "next/router";
import styles from "./Room.module.css";
import Video from "../../components/Video/Video";
import { SocketContext } from "../../providers/Context";
import Option from "../../components/Options/Option";
import Notification from "../../components/Notification/Notification";
import { ContextType } from "../../types";

const addVideo = (
  video: HTMLVideoElement,
  stream: MediaStream,
  ref: React.MutableRefObject<undefined>
) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  (ref.current as any).append(video);
};

const connectToNewUser = (userId, stream, peer, ref, peers) => {
  const call = peer.call(userId, stream);
  const video = window.document.createElement("video");
  call.on("stream", (userStream) => {
    addVideo(video, userStream, ref);
  });
  call.on("close", () => {
    video.remove();
  });
  peers[userId] = call;
};

const Room = ({}) => {
  const { socket, peer }: ContextType = React.useContext(SocketContext);
  const router = useRouter();
  // const [myVideo, setMyVideo] = React.useState<any>()
  const videosRef = React.useRef();
  console.log(router.query);
  const peers = {};

  socket.on("user-disconnected", (userId) => {
    if (peers[userId]) peers[userId].close();
  });

  React.useEffect(() => {
    let mounted: boolean = true;
    console.log(peer);
    if (mounted && typeof window !== "undefined") {
      const myVideo = window?.document?.createElement("video");
      myVideo.muted = true;
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
          video: true,
        })
        .then((stream) => {
          addVideo(myVideo, stream, videosRef);
          connectToNewUser(router.query.userId, stream, peer, videosRef, peers);
          peer?.on("call", (call) => {
            call.answer(stream);
            const userVideo = window?.document?.createElement("video");
            call.on("stream", (userStream) => {
              addVideo(userVideo, userStream, videosRef);
            });
          });
        });
    }
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className={styles.room}>
      {/* <Video />
       */}
      {/*  */}
      <div ref={videosRef} id="videos" className={styles.room__videos}></div>
    </div>
  );
};

export default Room;
