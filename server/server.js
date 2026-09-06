import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import groupRoutes from "./routes/groups.js";
import postRoutes from "./routes/posts.js";

import commentRoutes from "./routes/comments.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));

app.get("/api/ping", (req, res) => {
  res.json({ message: "pong", time: new Date().toISOString() });
});
app.use("/api/groups", groupRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
