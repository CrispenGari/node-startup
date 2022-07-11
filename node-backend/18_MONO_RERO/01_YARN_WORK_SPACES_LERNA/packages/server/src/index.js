const express = require("express");
const cors = require("cors");
const router = require("./routes/index.js");

const PORT = process.env.PORT || 3001;
const app = express();

app.use(cors());
app.use(express.json());
app.use(router);

app.listen(PORT, () => console.log("the server is running on port: %s", PORT));
