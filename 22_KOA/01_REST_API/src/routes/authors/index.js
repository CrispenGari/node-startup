const Router = require("koa-router");
const router = new Router({
  prefix: "/api/authors",
});

let authors = [
  { id: 1, bookTitle: "Fight Club", author: "Chuck Palahniuk" },
  { id: 2, bookTitle: "Sharp Objects", author: "Gillian Flynn" },
  { id: 3, bookTitle: "Frankenstein", author: "Mary Shelley" },
  { id: 4, bookTitle: "Into The Wild", author: "John Krakauer" },
];

router.get("/all", (ctx, next) => {
  ctx.body = authors; // this can be coming from a database
  next();
});

module.exports = router;
