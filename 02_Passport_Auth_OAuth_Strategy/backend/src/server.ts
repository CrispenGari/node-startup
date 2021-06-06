import express, { Application } from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import passport from "passport";
import passportLocal from "passport-local";
import dotenv from "dotenv";
// import Users from "./models";
import connection from "./connections";
import session from "express-session";
import cookieParser from "cookie-parser";
import { github, twitter, google, facebook } from "./strategies";

import { IUser } from "./types";
import Users from "./models";
//============== CONFIGURATIONS =========
dotenv.config();

//============== VARIABLES ==============
const app: Application = express();
const port = process.env.PORT || 3001;

mongoose.connect(
  connection,
  { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true },
  (error: Error) => {
    if (error) {
      throw error;
    } else {
      console.log("Connection estabilished.");
    }
  }
);
mongoose.connection.once("open", () => {
  console.log("Connected to cloud MongoDB.");
});
//============== MIDLEWARES =========
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
// app.set("trust proxy", 1);
app.use(cookieParser("anything"));
app.use(
  session({
    secret: "anything",
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 3600000 * 24 * 7 /* 3600000 = hour*/,
      // secure: true, /* Need to be changed to true when using https://*/
      sameSite: false,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(google);
passport.use(twitter);
passport.use(github);
passport.use(facebook);

// Serializing and Deserializing User

passport.serializeUser((user: any, done: any) => {
  console.log(user);
  return done(null, user._id);
});

passport.deserializeUser((id: string, done: any) => {
  Users.findById(id, (error: Error, doc: any) => {
    return done(null, doc);
  });
});
//----------------------------- Routes
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3000",
    session: true,
  }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("http://localhost:3000/");
  }
);

app.get("/auth/twitter", passport.authenticate("twitter"));
app.get(
  "/auth/twitter/callback",
  passport.authenticate("twitter", {
    failureRedirect: "http://localhost:3000",
    session: true,
  }),
  function (req, res) {
    res.redirect("http://localhost:3000");
  }
);

app.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["profile"] })
);
app.get(
  "/auth/github/callback",
  passport.authenticate("github", {
    failureRedirect: "http://localhost:3000",
    session: true,
  }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("http://localhost:3000/");
  }
);

app.get("/auth/facebook", passport.authenticate("facebook"));

app.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: "http://localhost:3000",
  }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("http://localhost:3000");
  }
);

app.get("/", (req, res) => {
  res.status(200).send("Hello world.");
});
app.get("/user", (req, res) => {
  console.log("User", req.user);
  res.status(200).send(req.user);
});
app.get("/auth/logout", (req, res) => {
  req.logOut();
  res.status(200).send("Done");
});
//============== STARTING SERVER ============
app.listen(port, () => {
  console.log("Server is running");
});
