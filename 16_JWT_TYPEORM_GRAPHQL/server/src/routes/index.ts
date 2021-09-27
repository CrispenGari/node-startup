import { Request, Response, Router } from "express";
import { __cookieName__ } from "../utils";
import jwt from "jsonwebtoken";
import { User } from "../entities/User";
import {
  createAccessToken,
  createRefreshToken,
  storeRefreshToken,
} from "../auth";
const router: Router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    name: "backend",
    language: "typescript",
    message: "hello world!",
  });
});

router.post("/refresh-token", async (req: Request, res: Response) => {
  const token = req.cookies[__cookieName__];
  if (!token) {
    return res.status(401).json({
      code: 401,
      message: "UnAuthorized",
      ok: false,
      accessToken: "",
    });
  }
  let payload: any = null;
  try {
    let tokenToVerify: string = String(token)
      .toLocaleLowerCase()
      .includes("Bearer")
      ? token.split(" ")[1]
      : token;
    payload = jwt.verify(tokenToVerify, process.env.REFRESH_TOKEN_SECRETE!);
  } catch (error) {
    console.error(error);
    return res.status(403).json({
      code: 403,
      message: "Forbidden",
      ok: false,
      accessToken: "",
    });
  }

  const user = await User.findOne({
    where: {
      userId: payload.userId,
    },
  });

  if (!user) {
    return res.status(403).json({
      code: 403,
      message: "Forbidden",
      ok: false,
      accessToken: "",
    });
  }

  if (user.tokenVersion !== payload.tokenVersion) {
    return res.status(403).json({
      code: 403,
      message: "Forbidden",
      ok: false,
      accessToken: "",
    });
  }
  storeRefreshToken(res, createRefreshToken(user));
  return res.status(200).json({
    code: 200,
    message: "ok",
    ok: true,
    accessToken: createAccessToken(user),
  });
});
export default router;
