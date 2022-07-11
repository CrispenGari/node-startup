import { Request, Response, Router } from "express";

const router: Router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    name: "backend",
    language: "typescript",
    message: "hello world!",
  });
});

export default router;
