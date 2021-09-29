import { NextFunction, Response } from "express";
import { verify } from "jsonwebtoken";
import {
  __cookieAccessTokenName__,
  __cookieRefreshTokenName__,
} from "../constants";
import { User } from "../entities/User";

import { generateRefreshToken, generateAccessToken } from "../auth";

export const authenticationMiddlewareFn = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const refreshToken = req.cookies[__cookieRefreshTokenName__];
  const accessToken = req.cookies[__cookieAccessTokenName__];
  if (!refreshToken && !accessToken) {
    return next();
  }
  try {
    const payload = verify(accessToken, process.env.ACCESS_TOKEN_SECRETE!);
    req.userId = (payload as any).userId;
    return next();
  } catch {}

  let data;

  try {
    data = verify(refreshToken, process.env.REFRESH_TOKEN_SECRETE!) as any;
  } catch {
    return next();
  }
  const user = await User.findOne({
    where: {
      userId: data.userId,
    },
  });
  if (!user || user.tokenVersion !== data.version) {
    return next();
  }
  res.cookie(__cookieAccessTokenName__, generateRefreshToken(user));
  res.cookie(__cookieRefreshTokenName__, generateAccessToken(user));
  req.userId = user.userId;
  return next();
};
