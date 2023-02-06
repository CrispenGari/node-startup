import {
  FastifyInstance,
  FastifyServerOptions,
  FastifyReply,
  FastifyRequest,
} from "fastify";

import { pool } from "../../db";
export const moviesRoute = async (
  fastify: FastifyInstance,
  options: FastifyServerOptions
) => {
  fastify.setErrorHandler(async (err) => {
    console.log(err.message);
    throw new Error("Error occured in the movies route");
  });

  fastify.get("/all", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const movies = await pool.query("SELECT * FROM movies;");
      return reply.status(200).send({
        code: 200,
        movies: movies.rows,
      });
    } catch (error: any) {
      console.log({ error });
      return reply.status(500).send({ code: 500, message: error.message });
    }
  });

  fastify.get(
    "/one/:uid",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const params: any = request.params;
        const movie = await pool.query(
          "SELECT * FROM movies WHERE uid=$1::integer;",
          [params.uid]
        );
        return reply.status(200).send({
          code: 200,
          movie: movie.rows![0],
        });
      } catch (error: any) {
        return reply.status(500).send({ code: 500, message: error.message });
      }
    }
  );

  fastify.put(
    "/update/:uid",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { params, body } = request;
        const { title, decription } = body as any;
        const data = await pool.query(
          `UPDATE movies SET title = $1, decription = $2 WHERE uid = $3 RETURNING *;`,
          [title, decription, (params as any).uid]
        );
        return reply.status(200).send({
          code: 200,
          movie: data.rows![0],
        });
      } catch (error: any) {
        return reply.status(500).send({ code: 500, message: error.message });
      }
    }
  );

  fastify.post("/new", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { body } = request;
      const { title, decription } = body as any;
      const data = await pool.query(
        "INSERT INTO movies (title, decription) VALUES($1, $2) RETURNING *;",
        [title, decription]
      );
      return reply.status(201).send({
        code: 201,
        movie: data.rows![0],
      });
    } catch (error: any) {
      return reply.status(500).send({ code: 500, message: error.message });
    }
  });
  fastify.delete(
    "/delete/:uid",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { params } = request;
        await pool.query("DELETE FROM movies WHERE uid=$1;", [
          (params as any).uid,
        ]);
        return reply.status(200).send({
          code: 200,
          deleted: true,
        });
      } catch (error: any) {
        return reply.status(500).send({ code: 500, message: error.message });
      }
    }
  );
};
