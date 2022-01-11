import KoaRouter from "koa-router";
import pool from "../db";

const router = new KoaRouter({
  prefix: "/api/movies",
});

// Creating a movie
router.post("/new", async (ctx, next) => {
  try {
    const { title, decription } = ctx.request.body;
    const data = await pool.query(
      "INSERT INTO movies (title, decription) VALUES($1, $2) RETURNING *;",
      [title, decription]
    );
    ctx.response.status = 201;
    ctx.body = data.rows;
    next();
  } catch (error) {
    ctx.response.status = 500;
    ctx.body = {
      status: 500,
      message: error?.message,
    };
    next();
  }
});

// Getting all movies
router.get("/all", async (ctx, next) => {
  try {
    ctx.response.status = 200;
    const movies = await pool.query("SELECT * FROM movies;");
    ctx.body = movies.rows;
    next();
  } catch (error) {
    ctx.response.status = 500;
    ctx.body = {
      status: 500,
      message: error?.message,
    };
    next();
  }
});

// Getting a movie by uid
router.get("/one/:uid", async (ctx, next) => {
  try {
    const { uid } = ctx.params;
    ctx.response.status = 200;
    const movie = await pool.query(
      "SELECT * FROM movies WHERE uid=$1::integer;",
      [uid]
    );
    ctx.body = movie.rows![0];
    next();
  } catch (error) {
    ctx.response.status = 500;
    ctx.body = {
      status: 500,
      message: error?.message,
    };
    next();
  }
});
// Deleting a movie by uid

router.delete("/delete/:uid", async (ctx, next) => {
  try {
    const { uid } = ctx.params;
    ctx.response.status = 200;
    await pool.query("DELETE FROM movies WHERE uid=$1;", [uid]);
    ctx.body = true;
    next();
  } catch (error) {
    ctx.response.status = 500;
    ctx.body = {
      status: 500,
      message: error?.message,
    };
    next();
  }
});

// Updating a movie

router.put("/update/:uid", async (ctx, next) => {
  try {
    const { uid } = ctx.params;
    const { title, decription } = ctx.request.body;

    const data = await pool.query(
      `UPDATE movies SET title = $1, decription = $2 WHERE uid = $3 RETURNING *;`,
      [title, decription, uid]
    );
    ctx.body = data.rows![0];
    next();
  } catch (error) {
    ctx.response.status = 500;
    ctx.body = {
      status: 500,
      message: error?.message,
    };
    next();
  }
});

export default router;
