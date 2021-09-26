require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const pool = require("../../db/index.js");
const router = express.Router();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null)
    return res.status(401).json({
      code: 401,
      message: "UnAuthorized",
    });
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, student) => {
    console.log(err);
    if (err)
      return res.status(403).json({
        code: 403,
        message: "Forbidden",
      });
    req.student = student;
    next();
  });
};

router.get("/user", authenticateToken, async (req, res) => {
  const data = await pool.query("SELECT * FROM students WHERE id=$1;", [
    req.student.id,
  ]);
  const student = data.rows[0];
  res.status(200).json(student);
});

module.exports = router;
