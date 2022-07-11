import dotenv from "dotenv";
dotenv.config();
export const connectionURL: string = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.nwk3n.mongodb.net/posts?retryWrites=true&w=majority`;
