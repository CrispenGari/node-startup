const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const pool = require("../../db/index.js");

router.post("/user", async (req, res) => {
  try {
    const { token } = req.body;
    if (token === null)
      return res.status(401).json({
        code: 401,
        message: "UnAuthorized",
      });
    const data = await pool.query("SELECT * FROM jwt WHERE token=$1;", [token]);
    if (data.rowCount === 0)
      return res.status(403).json({
        code: 403,
        message: "Forbidden",
      });
    jwt.verify(token, process.env.REFRESH_TOKEN, (err, student) => {
      if (err)
        res.status(403).json({
          code: 403,
          message: "Forbidden",
        });
      const accessToken = generateAccessToken(student);
      return res.json({
        accessToken: accessToken,
        service: "jwt",
      });
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: "Internal server Error.",
    });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const { token } = req.body;
    await pool.query("DELETE FROM jwt WHERE token=$1;", [token]);
    return res.status(204).json({
      code: 200,
      logout: true,
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: "Internal server Error.",
    });
  }
});

router.post("/register", async (req, res) => {
  // for the password i'm not going to hash it.
  try {
    const { username, email, password } = req.body;
    const data = await pool.query(
      "INSERT INTO students(username, password, email) VALUES ($1, $2, $3) RETURNING * ;",
      [username, password, email]
    );

    const student = data.rows[0];
    const accessToken = generateAccessToken(student);
    const refreshToken = generateRefreshToken(student);

    const tokenRes = await pool.query(
      "INSERT INTO jwt(token) VALUES ($1) RETURNING *;",
      [refreshToken]
    );
    if (tokenRes.rowCount > 0) {
      return res.status(201).json({
        accessToken: accessToken,
        refreshToken: refreshToken,
        service: "jwt",
      });
    } else {
      return res.status(500).json({
        code: 500,
        message: "Internal server Error.",
      });
    }
  } catch (error) {
    console.log(error);
    if (
      String(error.code) === "23505" ||
      String(error.message).includes("already exists")
    ) {
      return res.status(200).json({
        code: 200,
        message: "the username already taken.",
      });
    }
    return res.status(500).json({
      code: 500,
      message: "Internal server Error.",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const data = await pool.query(
      "SELECT * FROM students WHERE username=$1 AND password=$2;",
      [username, password]
    );
    const student = data.rows[0];
    if (data.rowCount === 0) {
      return res.status(403).json({
        code: 403,
        message: "Forbidden.",
      });
    }
    const accessToken = generateAccessToken(student);
    const refreshToken = generateRefreshToken(student);

    const tokenRes = await pool.query(
      "INSERT INTO jwt(token) VALUES ($1) RETURNING *;",
      [refreshToken]
    );
    if (tokenRes.rowCount > 0) {
      return res.status(201).json({
        accessToken: accessToken,
        refreshToken: refreshToken,
        service: "jwt",
      });
    } else {
      return res.status(403).json({
        code: 403,
        message: "Un authorized.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: "Internal server Error.",
    });
  }
});

const generateAccessToken = (student) => {
  return jwt.sign(student, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "30s",
  });
};
const generateRefreshToken = (student) => {
  return jwt.sign(student, process.env.REFRESH_TOKEN);
};
module.exports = router;
