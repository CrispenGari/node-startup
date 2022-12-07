import { PrismaClient, Prisma } from "@prisma/client";
import { Request } from "express";
import { GraphQLParams } from "graphql-yoga";
import Redis from "ioredis";

export interface CtxType {
  req: Request;
  params: GraphQLParams<Record<string, any>, Record<string, any>>;
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >;
  redis: Redis;
}
