require("dotenv").config();
const express = require("express");
const cors = require("cors");
const router = require("./routes/index.js");

//
const app = express();
const PORT = 3002 || process.env.PORT;
// ------
app.use(express.json());

app.post("/", (req, res) => {
  console.log(req.body);
});
app.use(cors());
app.use(router);

app.listen(PORT, () =>
  console.log("the auth server is listening on port: %s", PORT)
);
