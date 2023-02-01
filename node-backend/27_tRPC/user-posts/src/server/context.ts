import { NextApiResponse, NextApiRequest } from "next";
import { prisma } from "../utils/prisma";
export const createContext = ({
  req,
  res,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
}) => {
  return {
    req,
    res,
    prisma: prisma,
  };
};

export type ContextType = ReturnType<typeof createContext>;
