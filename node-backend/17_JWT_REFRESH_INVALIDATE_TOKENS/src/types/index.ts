import { Request, Response } from "express";
export interface ContextType {
  req: Request & { userId: string };
  res: Response;
}
