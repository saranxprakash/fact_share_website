import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    sourceUrl: { type: String, trim: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Fact-check verdict, filled in asynchronously after the post is created
    verdict: {
      status: {
        type: String,
        enum: ["pending", "verified", "disputed", "unverified"],
        default: "pending",
      },
      confidence: { type: Number, min: 0, max: 1 },
      reasoning: { type: String, maxlength: 1000 },
      sources: [{ type: String }],
      checkedAt: { type: Date },
    },
  },
  { timestamps: true },
);

export default mongoose.model("Post", postSchema);
