import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listPosts,
  createPost,
  upvotePost,
  deletePost,
} from "../controllers/postController.js";

const router = express.Router();

router.get("/", listPosts);
router.post("/", requireAuth, createPost);
router.post("/:id/upvote", requireAuth, upvotePost);
router.delete("/:id", requireAuth, deletePost);

export default router;
