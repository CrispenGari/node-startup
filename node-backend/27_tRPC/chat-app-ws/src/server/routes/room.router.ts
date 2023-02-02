import { publicProcedure, router } from "../server";
import { randomUUID } from "crypto";
import { observable } from "@trpc/server/observable";
import { Message, messageSubSchema, sendMessageSchema } from "../schema";
import { Events } from "../../constants";

export const roomRouter = router({
  sendMessage: publicProcedure
    .input(sendMessageSchema)
    .mutation(async ({ ctx: { ee }, input: { message, roomId, sender } }) => {
      const msg: Message = {
        id: randomUUID(),
        message,
        roomId,
        sender,
        sentAt: new Date(),
      };

      ee.emit(Events.SEND_MESSAGE, msg);
      return msg;
    }),
  onSendMessage: publicProcedure
    .input(messageSubSchema)
    .subscription(async ({ input: { roomId }, ctx: { ee } }) => {
      return observable<Message>((emit) => {
        const onMessage = (msg: Message) => {
          if (roomId === msg.roomId) {
            emit.next(msg);
          }
        };
        ee.on(Events.SEND_MESSAGE, onMessage);

        return () => {
          ee.off(Events.SEND_MESSAGE, onMessage);
        };
      });
    }),
});
