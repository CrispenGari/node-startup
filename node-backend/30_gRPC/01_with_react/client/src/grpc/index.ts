import { HelloClient } from "../proto/HelloServiceClientPb";

export const client = new HelloClient("http://localhost:3001");
