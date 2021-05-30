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
import GoogleStrategy from "passport-google-oauth20";
import TwitterStrategy from "passport-twitter";
import GitHubStrategy from "passport-github";
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
      maxAge: 1000 * 60 * 60 * 24 * 7,
      // secure: true,
      // sameSite: "none",
    },
    // resave: true,
    // saveUninitialized: true,
    // cookie: {
    //   sameSite: "none",
    //   // secure: true,
    //    // One Week
    // },
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user: any, done: any) => {
  console.log(user);
  return done(null, user._id);
});

passport.deserializeUser((id: string, done: any) => {
  Users.findById(id, (error: Error, doc: any) => {
    return done(null, doc);
  });
});
// --------------- GOOGLE ---------------
passport.use(
  new GoogleStrategy.Strategy(
    {
      clientID: `${process.env.GOOGLE_CLIENT_ID}`,
      clientSecret: `${process.env.GOOGLE_CLIENT_SECRET}`,
      callbackURL: "http://localhost:3001/auth/google/callback",
    },
    (accessToken, refreshToken, profile: any, cb) => {
      Users.findOne(
        { googleId: profile.id },
        async (error: Error, doc: any) => {
          if (error) {
            throw error;
          } else {
            if (!doc) {
              const newUser = new Users({
                googleId: profile.id,
                username: profile.displayName,
                provider: profile.provider,
              });
              await newUser.save();
              cb(null, newUser);
            } else {
              cb(null, doc);
            }
          }
        }
      );
    }
  )
);
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
// ------------------------ TWITTER ------------
passport.use(
  new TwitterStrategy.Strategy(
    {
      consumerKey: `${process.env.TWITTER_APP_ID}`,
      consumerSecret: `${process.env.TWITTER_APP_SECRET}`,
      callbackURL: "http://127.0.0.1:3001/auth/twitter/callback",
    },
    (accessToken: any, refreshToken: any, profile: any, cb: any) => {
      Users.findOne(
        { twitterId: profile.id },
        async (error: Error, doc: any) => {
          if (error) {
            throw error;
          } else {
            if (!doc) {
              const newUser = new Users({
                twitterId: profile.id,
                username: profile.displayName,
                provider: profile.provider,
              });
              await newUser.save();
              cb(null, newUser);
            } else {
              cb(null, doc);
            }
          }
        }
      );
    }
  )
);
app.get("/auth/twitter", passport.authenticate("twitter"));
app.get(
  "/auth/twitter/callback",
  passport.authenticate("twitter", {
    failureRedirect: "http://127.0.0.1:3000",
    session: true,
  }),
  function (req, res) {
    res.redirect("http://127.0.0.1:3000/");
  }
);

// -------------------------- GITHUB
passport.use(
  new GitHubStrategy.Strategy(
    {
      clientID: `${process.env.GITHUB_CLIENT_ID}`,
      clientSecret: `${process.env.GITHUB_CLIENT_SECRET}`,
      callbackURL: "http://localhost:3001/auth/github/callback",
    },
    (accessToken, refreshToken, profile, cb) => {
      Users.findOne(
        { githubId: profile.id },
        async (error: Error, doc: any) => {
          if (error) {
            throw error;
          } else {
            if (!doc) {
              const newUser = new Users({
                githubId: profile.id,
                username: profile.displayName,
                provider: profile.provider,
              });
              await newUser.save();
              cb(null, newUser);
            } else {
              cb(null, doc);
            }
          }
        }
      );
    }
  )
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
// ---------------------- FACEBOOK

// --------------------- Yahoo
//============== ROUTES ===========

app.get("/", (req, res) => {
  res.status(200).send("Hello world.");
});
app.get("/user", (req, res) => {
  console.log("User", req.user);
  res.status(200).send(req.user);
});
app.get("/logout", (req, res) => {
  req.logOut();
  res.status(200).send("Done");
});
//============== STARTING SERVER ============
app.listen(port, () => {
  console.log("Server is running");
});
// http://localhost:3000/auth/google
