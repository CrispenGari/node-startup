const Koa = require("koa");

const PORT = 3001 || process.env.PORT;
const app = new Koa();

app.use(async (ctx) => {
  ctx.body = "<h1>Hello world</h1>";
});

app.listen(PORT, () => {
  console.log("The server is running on port: %s", PORT);
});
