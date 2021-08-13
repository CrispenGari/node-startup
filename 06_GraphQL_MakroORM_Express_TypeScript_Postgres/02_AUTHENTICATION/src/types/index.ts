import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";

export type TodoContext = { em: EntityManager<IDatabaseDriver<Connection>> };
