import Koa from "koa";
import koaBody from "koa-body";
import router from "./routes";

const app = new Koa();
const PORT = process.env.PORT || 3001;

app.use(koaBody());

// routes middleware
app.use(router.routes());

app.listen(PORT, () => console.log("The server is running on port: %s", PORT));
