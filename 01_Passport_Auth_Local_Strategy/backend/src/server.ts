import express, { Application } from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import passport from "passport";
import passportLocal from "passport-local";
import dotenv from "dotenv";

//============== CONFIGURATIONS =========
dotenv.config();
console.log(`${process.env.MONGO_DB_PASSWORD}`);

//============== VARIABLES ==============
const app: Application = express();
const port = process.env.PORT || 3001;

//============== MIDLEWARES =============

//================ ROUTES ==============

app.get("/", (req, res) => {
  res.status(200).send("Hello world");
});
//============== STARTING SERVER ============
app.listen(port, () => {
  console.log("Sever is running");
});
