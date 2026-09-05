import jwt from "jsonwebtoken";
import User from "../models/User.js";

function makeToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export async function register(req, res) {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password || password.length < 8) {
      return res
        .status(400)
        .json({
          error: "Username, email, and an 8+ character password are required",
        });
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res
        .status(409)
        .json({ error: "That username or email is already taken" });
    }

    const user = new User({ username, email });
    await user.setPassword(password);
    await user.save();

    const token = makeToken(user._id);
    res
      .status(201)
      .json({ token, user: { id: user._id, username: user.username } });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.checkPassword(password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = makeToken(user._id);
    res.json({ token, user: { id: user._id, username: user.username } });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
}
