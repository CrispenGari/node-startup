import { serial, text, timestamp, pgTable, boolean } from "drizzle-orm/pg-core";
import { /*InferSelectModel*/ InferInsertModel } from "drizzle-orm";

export const todo = pgTable("todo", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export type Todo = InferInsertModel<typeof todo>;
