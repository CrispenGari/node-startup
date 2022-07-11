import dotenv from "dotenv";

dotenv.config();
export default `mongodb+srv://crispen:${process.env.PASSWORD}@cluster0.oevbp.mongodb.net/authors?retryWrites=true&w=majority`;
