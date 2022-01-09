const Koa = require("koa");
const koaBody = require("koa-body");
const authors = require("./routes/authors/index.js");
const books = require("./routes/books/index.js");

const app = new Koa();
const PORT = process.env.PORT || 3001;

// middlewares
app.use(koaBody());
app.use(authors.routes());
app.use(books.routes());

app.listen(PORT, () => console.log("The server is running on port: %s", PORT));
