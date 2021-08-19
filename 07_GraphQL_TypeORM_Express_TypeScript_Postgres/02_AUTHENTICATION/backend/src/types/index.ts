import express from "express";
import { Redis } from "ioredis";
export type UserContext = {
  req: express.Request & { session?: any };
  res: express.Response;
  redis: Redis;
};
