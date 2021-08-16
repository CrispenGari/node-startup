import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import express from "express";
export type UserContext = {
  em: EntityManager<IDatabaseDriver<Connection>>;
  req: express.Request & { session?: any };
  res: express.Response;
};
