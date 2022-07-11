import jwt from "jsonwebtoken";
import { Response } from "express";
import { User } from "../entities/User";
import { __cookieName__ } from "../utils";
export const createAccessToken = (user: User): string => {
  return jwt.sign(
    {
      userId: user.userId,
      tokenVersion: user.tokenVersion,
    },
    process.env.ACCESS_TOKEN_SECRETE!,
    {
      expiresIn: "10s",
    }
  );
};

export const createRefreshToken = (user: User): string => {
  return jwt.sign(
    {
      userId: user.userId,
      tokenVersion: user.tokenVersion,
    },
    process.env.REFRESH_TOKEN_SECRETE!,
    {
      expiresIn: "7d",
    }
  );
};

export const storeRefreshToken = (res: Response, token: string): void => {
  res.cookie(__cookieName__, token, {
    httpOnly: true,
    path: "/refresh-token",
  });
};
