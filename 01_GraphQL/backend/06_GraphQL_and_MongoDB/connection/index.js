import dotenv from "dotenv";
dotenv.config();
const dbName = "BooksAuthors";
const connection_url = `mongodb+srv://crispen:${process.env.PASSWORD}@cluster0.jka1q.mongodb.net/${dbName}?retryWrites=true&w=majority`;
export default connection_url;
