import { Router } from "express";
import http from "http";
import mysql from "mysql2";
import {
  ADD_STUDENT,
  CREATE_DATABASE_IF_NOT_EXIST_QUERY,
  CREATE_TABLE_IF_NOT_EXISTS,
  DELETE_BY_ID,
  GET_ALL_STUDENTS,
  GET_STUDENT_BY_ID,
  SELECT_DATABASE,
  UPDATE_STUDENT,
} from "./queries/index.js";
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

// CREATING DATABASE
connection.query(
  CREATE_DATABASE_IF_NOT_EXIST_QUERY("students"),
  (error, result) => {
    if (error) {
      console.log(error);
      return;
    }
    if (result) {
      console.log("database created.");
      return;
    }
  }
);
// SELECTING A DATABASE AND CREATING A TABLE

connection.query(SELECT_DATABASE("students"), (error) =>
  console.log(error ? error : "database selected")
);
connection.query(CREATE_TABLE_IF_NOT_EXISTS("students"), (error, res) => {
  if (error) {
    console.log(error);
    return;
  }
  if (res) {
    console.log("table created.");
    return;
  }
});

// HELLO WORLD ROUTE
router.get("/", (req, res) => {
  res.status(200).json({
    code: 200,
    method: req.method,
    message: "OK",
    description: "MySQL express server.",
  });
});

// CREATING STUDENTS ROUTE

router.post("/students/create", (req, res) => {
  const { stud_name, stud_surname, email, age } = req.body;

  if (!stud_name && !stud_surname && !email & !age) {
    return res.status(200).send({
      code: 200,
      message: "student name, email, surname and age required.",
    });
  }
  connection.query(ADD_STUDENT(req.body), (error, data) => {
    if (error) {
      console.log(error);
      return;
    }
    connection.query(GET_STUDENT_BY_ID(data.insertId), (error, student) => {
      return res.status(201).json(student);
    });
  });
});

// FETCHING ALL STUDENTS ROUTE
router.get("/students/all", (req, res) => {
  connection.query(GET_ALL_STUDENTS(), (error, student, fields) => {
    if (error) {
      console.log(error);
      return;
    }
    return res.status(201).json(student);
  });
});

// FETCHING STUDENT BY ID ROUTE
router.get("/students/one/:id", (req, res) => {
  const { id } = req.params;
  connection.query(GET_STUDENT_BY_ID(Number.parseInt(id)), (error, student) => {
    if (error) {
      return res.status(500).json({
        error: error,
      });
    }
    return res.status(200).json(student);
  });
});
// DELETING STUDENT ROUTE

router.delete("/students/delete/:id", (req, res) => {
  const { id } = req.params;
  connection.query(DELETE_BY_ID(Number.parseInt(id)), (error) => {
    if (error) {
      console.log(error);
      return;
    }
    return res.status(204).json({
      message: "Deleted.",
      code: 20,
    });
  });
});

// UPDATING STUDENT ROUTE

router.all("/students/update/:id", (req, res) => {
  const { id } = req.params;
  if (!req.body) {
    return res.status(200).json({
      message: "You should update either email or age",
    });
  }
  if (req.method !== "PATCH" && req.method !== "PUT") {
    return res.status(400).send({
      message: "only PATCH or PUT methods required for updating a student.",
    });
  }
  connection.query(
    UPDATE_STUDENT(Number.parseInt(id), req.body),
    (error, data) => {
      if (error) {
        console.log(error);
        return;
      }
      res.status(204).json(data);
    }
  );
});
router.get("/users", (req, res) => {});

export default router;
