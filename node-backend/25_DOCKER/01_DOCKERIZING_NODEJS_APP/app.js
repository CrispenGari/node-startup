const express = require("express");
const PORT = process.env.PORT || 3001;
const HOST = "0.0.0.0";
app = express();

app.all("*", (req, res) =>
  res.status(200).json({
    status: 200,
    message: "Hello world from Express.",
  })
);

app.listen(PORT, HOST, () =>
  console.log("The server is running on port: %s", PORT)
);
