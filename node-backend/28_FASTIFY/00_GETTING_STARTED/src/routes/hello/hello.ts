import {
  FastifyInstance,
  FastifyServerOptions,
  FastifyReply,
  FastifyRequest,
} from "fastify";

export const helloRoute = async (
  fastify: FastifyInstance,
  options: FastifyServerOptions
) => {
  fastify.setErrorHandler(async (err) => {
    console.log(err.message);
    throw new Error("caught");
  });

  fastify.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send({
      code: 200,
      message: "Hello world",
    });
  });
};
