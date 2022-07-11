import { Request, Response, Router } from "express";
import { MongoClient } from "mongodb";
const router: Router = Router();

const url: string = `mongodb://admin:password@localhost:27017`;
const databaseName: string = "todos";

router.get("/todos", async (_req: Request, res: Response) => {
  await MongoClient.connect(
    url,
    {
      auth: {
        username: "admin",
        password: "password",
      },
    },
    (err: any, client) => {
      if (err) {
        console.log(err.message);
        return;
      }
      const db = client?.db(databaseName);
      if (!db) {
        return res.status(500).json({
          status: 500,
          error: "database not found",
        });
      }
      return res.status(200).send(db.collection("todos").find({}));
    }
  );
});

router.get("/todo/:id", async (req, res) => {
  const { id } = req.params;

  await MongoClient.connect(url, {}, (err: any, client) => {
    if (err) {
      throw err;
    }
    const db = client?.db(databaseName);
    if (!db) {
      return res.status(500).json({
        status: 500,
        error: "database not found",
      });
    }
    return res.status(200).send(db.collection("todos").find({ id }));
  });
});

router.post("/todo/create", async (req: Request, res: Response) => {
  const data = req.body;

  await MongoClient.connect(url, {}, (err: any, client) => {
    if (err) {
      throw err;
    }
    const db = client?.db(databaseName);
    if (!db) {
      return res.status(500).json({
        status: 500,
        error: "database not found",
      });
    }
    return res.status(201).send(db.collection("todos").insertOne({ ...data }));
  });
});

export default router;
