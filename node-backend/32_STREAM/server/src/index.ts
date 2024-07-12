import "dotenv/config";
import load from "node-env-types";
import express from "express";
import { StreamChat } from "stream-chat";
import { compare, genSaltSync, hashSync } from "bcrypt";
import cors from "cors";

load();
const { PORT, STREAM_API_KEY, STREAM_API_SECRET } = process.env;
const client = StreamChat.getInstance(STREAM_API_KEY!, STREAM_API_SECRET);
const salt = genSaltSync(10);
const app = express();

interface User {
  id: string;
  email: string;
  password: string;
}
const USERS: User[] = [];

app.use(express.json());
app.use(cors());
// Create user in Stream Chat
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required.",
    });
  }

  // Minlength 7
  if (password.length < 3) {
    return res.status(400).json({
      message: "Password must be at least 3 characters.",
    });
  }

  const existingUser = USERS.find((user) => user.email === email);

  if (existingUser) {
    return res.status(400).json({
      message: "User already exists.",
    });
  }

  try {
    const hashed_password = hashSync(password, salt);
    // Generate random id and push to in memory users
    const id = Math.random().toString(36).substr(2, 9);
    const user = {
      id,
      email,
      password: hashed_password,
    };
    USERS.push(user);

    // Create user in Stream Chat
    await client.upsertUser({
      id,
      email,
      name: email,
    });

    // Create token for user
    const token = client.createToken(id);

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (e) {
    return res.json({
      message: "User already exists.",
    });
  }
});

// Login user
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = USERS.find((user) => user.email === email);
  if (!user) {
    return res.status(400).json({
      message: "Invalid email.",
    });
  }
  const correct = await compare(password, user.password);
  if (!correct) {
    return res.status(400).json({
      message: "Invalid password.",
    });
  }
  // Create token for user
  const token = client.createToken(user.id);
  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
    },
  });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
