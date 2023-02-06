import { FastifyRequest, FastifyReply } from "fastify";


export type CtxType ={
    user?: {
        username: string;
        email: string;
        age: number;
        gender: string;
    },
  req: FastifyRequest,
  rep: FastifyReply
}