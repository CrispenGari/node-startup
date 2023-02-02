import { Message } from "@/server/schema";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import React, { useState } from "react";

interface Props {}
const Room: React.FC<Props> = ({}) => {
  const router = useRouter();

  const { mutate, isLoading } = trpc.room.sendMessage.useMutation();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const sendMessage = async (e: any) => {
    e.preventDefault();
    if (message.trim().length === 0) return;
    await mutate({
      message,
      roomId: router.query.roomId as string,
      sender: router.query.name as string,
    });
  };
  trpc.room.onSendMessage.useSubscription(
    { roomId: router.query.roomId as string },
    {
      onData(data) {
        setMessages((m) => [...m, data]);
      },
    }
  );
  return (
    <div className="[roomId]">
      <h1>Room {router.query.roomId}</h1>
      <br />
      <br />
      <ul>
        {messages.map((message) => (
          <li key={message.id}>{message.message}</li>
        ))}
      </ul>

      <br />
      <br />

      <form onSubmit={sendMessage}>
        <input
          type="text"
          placeholder="What do you want to say"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit" disabled={isLoading}>
          SEND
        </button>
      </form>
    </div>
  );
};

export default Room;
