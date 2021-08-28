import { Router, Request, Response } from "express";
import fetchResults from "../middlewares";
import fetchResultsMySql from "../middlewares/mysql";
import Post from "../mongodb/models";
const router: Router = Router();
router.get(
  "/posts",
  fetchResults(Post),
  (_req: Request, res: Response | any) => {
    return res.json(res.paginatedResults);
  }
);
router.get(
  "/posts/mysql",
  fetchResultsMySql(),
  (_req: Request, res: Response | any) => {
    return res.json(res.paginatedResults);
  }
);
export default router;
