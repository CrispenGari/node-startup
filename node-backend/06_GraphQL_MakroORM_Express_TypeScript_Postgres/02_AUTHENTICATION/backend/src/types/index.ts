import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import express from "express";
import { Redis } from "ioredis";
export type UserContext = {
  em: EntityManager<IDatabaseDriver<Connection>>;
  req: express.Request & { session?: any };
  res: express.Response;
  redis: Redis;
};
