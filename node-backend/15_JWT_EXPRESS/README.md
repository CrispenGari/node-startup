### JSONWebTokens (jwt) with express and Postgres

In this one we are going to look at how we can authenticate or authorize users using the `jwt` approach.

### Code boiler plate

Other packages like express, dotenv are installed and initialized using

```shell
npx @crispengari/node-backend
```

### Installation

1. jsonwebtoken

```shell
yarn add jsonwebtoken

# OR

npm i jsonwebtoken
```

2. pg
   This package helps us to communicate with postgres using nodejs.

```shell
yarn add pg

# OR

npm i pg
```

### Creating a database

```sql
CREATE DATABASE jwt;
```

### Creating tables

We are going to have tow tables. The first one will store our students and the second table will store our refreshJwtTokens. To create these tables we are going to run the following commands.

```sql
-- refreshTokens

CREATE TABLE jwt(
    id SERIAL NOT NULL PRIMARY KEY,
    token TEXT NOT NULL
)

-- students table
CREATE TABLE students(
    id SERIAL NOT NULL PRIMARY KEY,
    username VARCHAR(15) NOT NULL UNIQUE,
    password VARCHAR(15) NOT NULL,
    email VARCHAR(25) NOT NULL
)
```

We are going to have 2 servers that will be listening on different ports, the first one will be listening on port: 3001 and the other one will be listening on port: 3002. We will change scripts in the `package.json` that will start these severs. Note that each server will be in it's own folder there are two folders in the `src` the `auth` and the `server`.

```json
// package.json

"scripts": {
    "start:auth": "node src/auth/server.js",
    "start:server": "node src/server/server.js",
    "dev:auth": "nodemon src/auth/server.js",
    "dev:server": "nodemon src/server/server.js"
}
```

We are going then to create an instance of a Postgres pool connection that we will use throughout the application in the `db/index.js` file as follows:

```js
const { Pool } = require("pg");
const pool = new Pool({
  host: "localhost" || "127.0.0.1",
  password: "root",
  user: "postgres",
  port: 5432,
  database: "jwt",
});

module.exports = pool;
```

### Registering the user.

To register the user we need to ensure register add them in the database and then generate the Access Token and Refresh token. These tokens are the ones that we will sent as payload to the client. The following route does that and it is found in the `/auth/routes/index.js` file.

```js
router.post("/register", async (req, res) => {
  // for the password i'm not going to hash it.
  try {
    const { username, email, password } = req.body;
    const data = await pool.query(
      "INSERT INTO students(username, password, email) VALUES ($1, $2, $3) RETURNING * ;",
      [username, email, password]
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
```

### Login in the user.

To login the user we are going to:

1. Check if the user with the given username or password exists in the database
2. The rest will be the same as the register part the route will be looking as follows:

```js
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
```

### Logout

To logout the student we need to do the following:

1. Delete the refresh token and access token from the database.

```ts
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
```

### Accessing the user based on their token

1. Get the token from the user (this token will be the token they get when login or registering) refresh token.
2. Check if the token exists in the database
3. Verify the token using jwt to get the user back.
4. We generate a new token based on the user returned and send them a new access token

```js
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
```

Now in another server which is running on port: 3001 we are going to try to access the student with their jwt tokens. We are going to get the token from the request headers and try to authenticate the student if the token has not yet expired as during login and register we created accessToken that expires within 30s. So the token will be valid up until 30s is finished.

Here is the code in the `/server/routes/index.js`

```js
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
```

**Note:** The token that we will be sending to the headers is the accessToken. Which is the token that we get wen we authenticate the user, either the user register or login they get this token. We need to pass it in request headers for example:

```requests.rest
GET http://localhost:3001/user
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwidXNlcm5hbWUiOiJ1c2VyMSIsInBhc3N3b3JkIjoidXNlcjEiLCJlbWFpbCI6ImhhamFrIiwiaWF0IjoxNjMyNjU2NDM2LCJleHAiOjE2MzI2NTY0NjZ9.A_yRrsdMkCKQ9ZUF45YxME685TIxQJIGz2VwlFSAu48
```

This is the power of `jwt` it allows us to access the user from another application which is running on different port, as long we have their `accessToken`.

That's all I wanted to show in this one!
