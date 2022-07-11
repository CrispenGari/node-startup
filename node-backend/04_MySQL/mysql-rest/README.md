### MySQL express Server

In this readme we are going to user mysql and express to create a REST application that performs some CRUD operations from the client.

### Sample code:

```js
export const GET_ALL_STUDENTS = () => {
  return `SELECT * FROM students;`;
};

export const GET_STUDENT_BY_ID = (id) => {
  return `SELECT * FROM students WHERE id LIKE ${id} LIMIT 1;`;
};

export const DELETE_BY_ID = (id) => {
  return `DELETE FROM students WHERE id = ${id};`;
};
```

### We are using

1. mysql2 - **allows us to communicate with our local mysql server**
2. express
3. cors

### Installation

```
npm i express mysql2 cors
```

### Requirements

Make sure you have MySQL installed locally on your computer.

### File Structures.

All the routes will be in the `src/routes.js` file.

### Connecting to local MySQL server.

The following code will create a connection of MySQL local server using the `mysql2` driver.

### `routes.js`.

```js
import { Router } from "express";
import http from "http";
import mysql from "mysql2";
const router = Router();

// CONNECTING TO THE SERVER

const port = 3306;
const user = "root";
const password = "root";
const host = "127.0.0.1" || localhost;

const connection = mysql.createConnection({
  user: user,
  port: port,
  host: host,
  password: password,
});
connection.connect(() => console.log("connected to MySQL local server"));

router.get("/", (req, res) => {
  res.status(200).json({
    code: 200,
    method: req.method,
    message: "OK",
    description: "MySQL express server.",
  });
});

router.get("/users", (req, res) => {});

export default router;
```

> All the code will be found in files. I'm going to use `Postman` to make API request to endpoints.
