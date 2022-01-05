import express from "express";
import { Stream } from "stream";

export interface CtxType {
  req: express.Request;
  res: express.Response;
}

export interface Upload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => Stream;
}
