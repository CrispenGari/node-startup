import { observable } from "@trpc/server/observable";
import { z } from "zod";
import { Events } from "../constants";
import { publicProcedure, router } from "../trpc/trpc";

export const notificationRouter = router({
  notify: publicProcedure
    .input(z.object({ message: z.string() }))
    .mutation(async ({ ctx: { ee }, input: { message } }) => {
      ee.emit(Events.NOTIFY_EVENT, { message });
      return { message };
    }),
  onNotification: publicProcedure.subscription(async ({ ctx: { ee } }) => {
    return observable<{ message: string }>((emit) => {
      const onNoti = ({ message }: { message: string }) => {
        emit.next({
          message,
        });
      };
      ee.on(Events.NOTIFY_EVENT, onNoti);
      return () => {
        ee.off(Events.NOTIFY_EVENT, onNoti);
      };
    });
  }),
});
