import dotenv from "dotenv";
dotenv.config();
const dbName: string = "users";

const url: string = `mongodb+srv://crispen:${process.env.MONGO_DB_PASSWORD}@cluster0.8phgp.mongodb.net/${dbName}?retryWrites=true&w=majority`;
export default url;
