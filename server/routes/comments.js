import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listComments,
  createComment,
  deleteComment,
} from "../controllers/commentController.js";

const router = express.Router();

router.get("/:postId", listComments);
router.post("/:postId", requireAuth, createComment);
router.delete("/:id", requireAuth, deleteComment);

export default router;
