import mongoose from "mongoose";

const Book = new mongoose.Schema({
  name: { type: String, required: true },
  authorId: { type: String, required: true },
});

const Author = new mongoose.Schema({
  name: { type: String, required: true },
});

const author = mongoose.model("authors", Author);
const book = mongoose.model("books", Book);

export { author, book };
