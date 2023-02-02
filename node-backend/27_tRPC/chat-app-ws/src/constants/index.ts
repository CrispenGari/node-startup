export const baseUrl: string = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : "http://localhost:3000";

export const url: string = `${baseUrl}/api/trpc`;

export enum Events {
  SEND_MESSAGE = "SEND_MESSAGE",
}
