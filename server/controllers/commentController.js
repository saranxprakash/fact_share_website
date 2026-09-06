import Comment from "../models/Comment.js";

export async function listComments(req, res) {
  const { postId } = req.params;
  const comments = await Comment.find({ post: postId })
    .populate("author", "username")
    .sort({ createdAt: 1 }); // oldest first, like a normal conversation thread
  res.json(comments);
}

export async function createComment(req, res) {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: "Comment can't be empty" });
    }

    const comment = await Comment.create({
      post: postId,
      author: req.userId,
      content,
    });

    // Populate before sending back so the frontend can show the username immediately
    await comment.populate("author", "username");
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: "Failed to add comment" });
  }
}

export async function deleteComment(req, res) {
  const comment = await Comment.findById(req.params.id);
  if (!comment) return res.status(404).json({ error: "Comment not found" });

  if (comment.author.toString() !== req.userId) {
    return res
      .status(403)
      .json({ error: "You can only delete your own comments" });
  }

  await comment.deleteOne();
  res.json({ success: true });
}
