require("dotenv").config();
const express = require("express");
const cors = require("cors");
const router = require("./routes/index.js");
//
const app = express();
const PORT = 3001 || process.env.PORT;

// ------

app.use(cors());
app.use(express.json());
app.use(router);

app.listen(PORT, () => {
  console.log(`The server server is running on port: ${PORT}`);
});
