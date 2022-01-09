const Router = require("koa-router");
const { body } = require("koa/lib/response");
const router = new Router({
  prefix: "/api/books",
});

let books = [
  { id: 101, name: "Fight Club", author: "Chuck Palahniuk" },
  { id: 102, name: "Sharp Objects", author: "Gillian Flynn" },
  { id: 103, name: "Frankenstein", author: "Mary Shelley" },
  { id: 101, name: "Into The Wild", author: "John Krakauer" },
];

router.get("/all", (ctx, next) => {
  ctx.body = books;
  next();
});

router.get("/one/:id", (ctx, next) => {
  if (ctx.params.id) {
    const book = books.find(
      (book) => book.id === Number.parseInt(ctx.params.id)
    );
    if (!book) {
      ctx.response.status = 404;
      ctx.body = {
        status: 404,
        message: `Could not find the book with id: ${ctx.params.id}`,
      };
      next();
    } else {
      ctx.response.status = 200;
      ctx.body = book;
      next();
    }
  } else {
    ctx.response.status = 500;
    ctx.body = {
      status: 500,
      message: "Internal server error.",
    };
    next();
  }
});

router.post("/new", (ctx, next) => {
  try {
    const { id, name, author } = ctx.request.body;
    books.push({
      id,
      name,
      author,
    });
    ctx.response.status = 201;
    ctx.body = {
      id,
      name,
      author,
    };
    next();
  } catch (error) {
    ctx.response.status = 400;
    ctx.body = {
      status: 500,
      message: "provide the id, name and author for the book.",
    };
    next();
  }
});

router.delete("/delete/:id", (ctx, next) => {
  if (ctx.params.id) {
    books = books.filter((book) => book.id !== ctx.params.id);
    ctx.body = true;
    next();
  } else {
    ctx.response.status = 500;
    ctx.body = false;
    next();
  }
});
module.exports = router;
