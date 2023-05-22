import { Auth } from "@vonage/auth";
import { Vonage } from "@vonage/server-sdk";

const auth = new Auth({
  apiKey: process.env.API_KEY as string,
  apiSecret: process.env.API_SECRETE as string,
});

export const vonage = new Vonage(auth);
