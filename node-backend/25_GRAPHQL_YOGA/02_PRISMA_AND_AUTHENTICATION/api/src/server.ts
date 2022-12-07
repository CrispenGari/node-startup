import "dotenv/config";
import express from "express";
import cors from "cors";
import router from "./routes";
import { PrismaClient } from "@prisma/client";
import { createYoga } from "graphql-yoga";
import { schema } from "./schema";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
const prisma = new PrismaClient();

const PORT: any = 3001 || process.env.PORT;

(async () => {
  const app: express.Application = express();
  const RedisStore = connectRedis(session);
  const redisClient = new Redis();
  app.use(
    cors({
      credentials: true,
      origin: "http://localhost:3000",
    })
  );
  app.use(
    session({
      store: new RedisStore({ client: redisClient, disableTouch: true }),
      saveUninitialized: true,
      secret: "secret",
      resave: false,
      name: "uid",
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        secure: false, // https when true
        sameSite: "lax",
      },
    })
  );

  const yoga = createYoga({
    schema,
    context: ({ request: req, params }) => ({
      req,
      params,
      prisma,
      redis: redisClient,
    }),
    graphiql: true,
    landingPage: false,
    cors: false,
  });
  app.use(express.json());
  app.use(router);
  app.use("/graphql", yoga);
  app.listen(PORT);
})()
  .then(() => console.log(`The server is running on port: ${PORT}`))
  .catch((err) => console.log(err))
  .finally(async () => {
    await prisma.$disconnect();
  });
