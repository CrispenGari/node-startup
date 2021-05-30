import express, { Application } from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import passport from "passport";
import passportLocal from "passport-local";
import dotenv from "dotenv";
import Users from "./models";
import connection from "./connections";
import session from "express-session";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import { IUser } from "./types";
//============== CONFIGURATIONS =========
dotenv.config();

//=============== MONGODB CONNECTION
mongoose.connect(
  connection,
  {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (error: Error) => {
    if (error) {
      throw error;
    } else {
      console.log("Connected to mongodb.");
    }
  }
);

mongoose.connection.once("open", (): void => {
  console.log("Cloud mongodb connection open.");
});

//============== VARIABLES ==============
const app: Application = express();
const port = process.env.PORT || 3001;
const passportLocalStrategy = passportLocal.Strategy;

//============== MIDLEWARES =============
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(cookieParser("anything"));
app.use(
  session({
    secret: "anything",
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new passportLocalStrategy((username: string, password: string, done) => {
    Users.findOne({ username: username }, (error: Error, user: any) => {
      if (error) {
        throw error;
      }
      if (!user) {
        return done(null, false);
      } else {
        bcrypt.compare(
          password,
          user.password,
          (error: Error, result: boolean) => {
            if (error) {
              throw error;
            }
            if (result === true) {
              return done(null, user);
            } else {
              return done(null, false);
            }
          }
        );
      }
    });
  })
);
passport.serializeUser((user: any, callback) => {
  callback(null, user._id);
});
passport.deserializeUser((id, callback) => {
  Users.findOne({ _id: id }, (error: Error, user: any) => {
    callback(error, {
      username: user.username,
    });
  });
});

//================ ROUTES ==============

app.get("/", (req, res) => {
  res.status(200).send("Hello world");
});

app.get("/user", (req, res) => {
  res.status(200).send(req.user);
  console.log(req.user);
});
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  Users.findOne({ username: username }, async (error: Error, doc: any) => {
    if (error) {
      throw error;
    }
    if (doc) {
      return res.status(200).send("Username already exist.");
    } else {
      const hashed_pwd = await bcrypt.hash(password, 10);
      const newUser = new Users({
        username: username,
        password: hashed_pwd,
      });
      await newUser.save();
      res.status(201).send("Registered");
    }
  });
});
app.post("/login", (req, res, next) => {
  passport.authenticate("local", (error, user, info) => {
    if (error) {
      throw error;
    }
    if (!user) {
      res.status(200).send("No user with given credentials.");
    } else {
      req.logIn(user, (error) => {
        if (error) {
          throw error;
        } else {
          res.send("Successfully Authenticated");
          console.log(req.user);
        }
      });
    }
  })(req, res, next);
});

//============== STARTING SERVER ============
app.listen(port, () => {
  console.log("Sever is running");
});
