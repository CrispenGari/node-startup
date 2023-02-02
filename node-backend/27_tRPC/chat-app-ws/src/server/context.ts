import EventEmitter from "events";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../utils/prisma";

const ee = new EventEmitter();
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
    ee,
    // prisma,
  };
};

export type ContextType = ReturnType<typeof createContext>;
