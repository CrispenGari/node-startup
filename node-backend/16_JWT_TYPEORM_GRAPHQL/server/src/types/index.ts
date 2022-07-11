import { Response, Request } from "express";

export interface ContextType {
  req: Request;
  res: Response;
  payload: any;
}
