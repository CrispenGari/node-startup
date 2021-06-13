import mongoose from "mongoose";

const BookSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  pages: {
    type: Number,
    required: true,
  },
});
const AuthorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  books: [BookSchema],
});

export default mongoose.model("authors", AuthorSchema);
