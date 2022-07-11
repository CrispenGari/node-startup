import express from "express";
import { Redis } from "ioredis";
export interface UserContext {
  req: express.Request & {
    session: any;
  };
  res: express.Response;
  redis: Redis;
}
