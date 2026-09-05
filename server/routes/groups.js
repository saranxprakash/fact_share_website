import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listGroups,
  getGroup,
  createGroup,
  joinGroup,
  leaveGroup,
} from "../controllers/groupController.js";

const router = express.Router();

router.get("/", listGroups);
router.get("/:id", getGroup);
router.post("/", requireAuth, createGroup);
router.post("/:id/join", requireAuth, joinGroup);
router.post("/:id/leave", requireAuth, leaveGroup);

export default router;
