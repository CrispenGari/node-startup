import { Router, Response, Request } from "express";
import { todo } from "../schema/todo";
import { db } from "../db";
import { eq } from "drizzle-orm";

const todoRouter = Router({
  caseSensitive: true,
});

const handleQueryError = (err: any, res: Response) => {
  return res
    .status(500)
    .json({ error: "An error occurred while executing the query." });
};

todoRouter.get("/", async (req: Request, res: Response) => {
  try {
    const t = await db.select().from(todo);
    return res.status(200).json({ todo: t });
  } catch (error) {
    return handleQueryError(error, res);
  }
});

todoRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const t = await db
      .select()
      .from(todo)
      .where(eq(todo.id, Number.parseInt(id)));
    return res.status(200).json({ todo: t[0] });
  } catch (error) {
    return handleQueryError(error, res);
  }
});
todoRouter.patch("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const t = await db
      .update(todo)
      .set({ title })
      .where(eq(todo.id, Number.parseInt(id)))
      .returning({ id: todo.id });
    return res.status(200).json({ todo: t[0] });
  } catch (error) {
    return handleQueryError(error, res);
  }
});
todoRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.delete(todo).where(eq(todo.id, Number.parseInt(id)));
    return res.status(200).json({ todo: true });
  } catch (error) {
    return handleQueryError(error, res);
  }
});
todoRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { title } = req.body;
    const t = await db.insert(todo).values({ title }).returning({
      id: todo.id,
    });
    return res.status(200).json({ id: t[0].id });
  } catch (error) {
    return handleQueryError(error, res);
  }
});

export default todoRouter;
