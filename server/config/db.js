import mongoose from "mongoose";

// Connects to MongoDB using the URI in your .env file.
// Called once when the server starts.
export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1); // stop the server if the DB can't connect
  }
}
