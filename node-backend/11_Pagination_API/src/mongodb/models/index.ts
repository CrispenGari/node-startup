import mongoose, { Schema, models } from "mongoose";

const Post = new Schema({
  title: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    default: new Date(),
  },
});

const model = models.Posts ? models.Posts : mongoose.model("Posts", Post);

export default model;
