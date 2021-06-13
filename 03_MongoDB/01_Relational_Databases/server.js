import express from "express";
import mongoose from "mongoose";
import http, { request } from "http";
import cors from "cors";
import url from "./connection/index.js";
import Author from "./models/index.js";

const app = express();
app.use(cors());
app.use(express.json());

// Connecting to the database

mongoose.connect(
  url,
  {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (error) => {
    if (error) {
      throw error;
    }
    console.log("Connected to mongoDB");
  }
);

mongoose.connection.once("open", (error) => {
  if (error) {
    throw error;
  }
  console.log("Connection open");
});

app.get("/authors", (req, res) => {
  Author.find({}, (error, doc) => {
    if (error) {
      throw error;
    }
    if (!doc) {
      return res.status(404).send("No authors found.");
    }
    return res.status(200).send(doc);
  });
});

app.get("/author/:id", (req, res) => {
  const { id } = req.params;
  Author.findById(id, (error, doc) => {
    if (error) {
      throw error;
    }
    if (!doc) {
      return res.status(404).send("Author not found.");
    }
    return res.status(200).send(doc);
  });
});
// 60c5c4a1d386bc0be41536f8
app.patch("/author/:id", (req, res) => {
  const { id } = req.params;
  Author.findById(id, (error, res_doc) => {
    if (!res_doc) {
      return res.status(304).send("Not Modified");
    } else {
      const data = req.body;
      const new_values = {
        $set: {
          name: data.name,
          books: data.books,
        },
      };
      Author.findByIdAndUpdate(id, new_values, (error, doc) => {
        if (error) {
          throw error;
        }
        res.status(200).send(doc);
      });
    }
  });
});
app.delete("/author/:id", (req, res) => {
  const { id } = req.params;
  Author.findByIdAndDelete(id, (error, doc) => {
    if (error) {
      return error;
    } else {
      res.status(204).send(doc);
    }
  });
});
app.post("/author", (req, res) => {
  const data = req.body;
  const author = new Author(data);
  author.save();
  res.status(201).send(author);
});

app.listen(3001, () => console.log("The server is running."));
