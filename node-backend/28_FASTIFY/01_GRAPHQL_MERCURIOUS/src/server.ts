import Fastify from "fastify";
import mercurius from "mercurius";
import { resolvers } from "./resolvers";
import { schema } from "./schema";
import { CtxType } from "./types";

const PORT: any = process.env.PORT || 3001;
const HOST =
  process.env.NODE_ENV === "production"
    ? "0.0.0.0"
    : "localhost" || "127.0.0.1";

const fastify = Fastify({
  logger: true,
  ignoreTrailingSlash: true,
});

fastify.register(mercurius, {
  schema,
  resolvers,
  graphiql: true,
  context: (request, reply): CtxType => {
    const user = {
      username: "username",
      email: "email@gmail.com",
      age: 23,
      gender: "male",
    };
    return {
      req: request,
      rep: reply,
      user,
    };
  },
});

fastify.listen({ port: PORT, host: HOST }, (error, address) => {
  if (error) {
    fastify.log.error(error);
    process.exit(1);
  }
  fastify.log.info(` Server is now listening on ${address}`);
});
