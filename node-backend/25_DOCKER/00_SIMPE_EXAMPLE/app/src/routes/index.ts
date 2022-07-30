//
import Todos from "../model";
import { Request, Response, Router } from "express";
import mongoose from "mongoose";
const router: Router = Router();

const url: string = `mongodb://admin:password@localhost:27017`;
mongoose.connect(url, {}, (err) => {
  if (err) {
    throw err;
  }
  console.log("connected to mongodb.");
});
mongoose.connection.once("open", (err) => {
  if (err) {
    throw err;
  }
  console.log("Ready to accept connections");
});

router.get("/todos", (_req: Request, res: Response) => {
  Todos.find({}, (error: any, doc: any) => {
    if (error) {
      throw error;
    }
    if (!doc) {
      return res.status(404).send("No todos found.");
    }
    return res.status(200).send(doc);
  });
});

router.get("/todo/:id", (req, res) => {
  const { id } = req.params;
  Todos.findById(id, (error: any, doc: any) => {
    if (error) {
      throw error;
    }
    if (!doc) {
      return res.status(404).send("Todo not found.");
    }
    return res.status(200).send(doc);
  });
});

router.post("/todo/create", (req: Request, res: Response) => {
  const data = req.body;
  const todo = new Todos(data);
  todo.save();
  res.status(201).send(todo);
});

export default router;
