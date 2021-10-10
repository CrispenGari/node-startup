import mongoose from "mongoose";

const User = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  provider: {
    type: String,
    required: true,
  },
  facebookId: {
    type: String,
    required: false,
  },
  githubId: {
    type: String,
    required: false,
  },
  googleId: {
    type: String,
    required: false,
  },
  twitterId: {
    type: String,
    required: false,
  },
});

const model = mongoose.model("users", User);
export default model;
