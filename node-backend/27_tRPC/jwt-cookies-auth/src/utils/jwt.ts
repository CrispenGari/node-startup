import { User } from "@prisma/client";
import jwt from "jsonwebtoken";

const TOKEN_SECRET = process.env.TOKEN_SECRET || "dfghjklUaooajjhaj";
export const signJwt = ({ username, email, id }: User) => {
  return jwt.sign(
    {
      id,
      email,
      username,
    },
    TOKEN_SECRET
  );
};

export const verifyJwt = (token: string) => {
  return jwt.verify(token, TOKEN_SECRET) as {
    username: string;
    email: string;
    id: string;
  };
};
