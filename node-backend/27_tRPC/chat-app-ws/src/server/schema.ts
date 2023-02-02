import { string } from "prop-types";
import {z} from "zod";

export const sendMessageSchema = z.object({
  roomId: z.string(),
  message: z.string(),
  sender: z.string()
});

const messageSchema = z.object({
  id: z.string(),
  message: z.string(),
  roomId: z.string(),
  sentAt: z.date(),
  sender: z.string()
});

export type Message = z.TypeOf<typeof messageSchema>;

export const messageSubSchema = z.object({
  roomId: z.string(),
});