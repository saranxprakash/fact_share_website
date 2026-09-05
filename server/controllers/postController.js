import Post from "../models/Post.js";
import Group from "../models/Group.js";
import { runFactCheck } from "../services/factCheck.js";

export async function listPosts(req, res) {
  const { group, sort } = req.query;
  if (!group) {
    return res.status(400).json({ error: "A group id is required" });
  }

  let posts = await Post.find({ group })
    .populate("author", "username")
    .limit(50);

  // Sort in JS since "most upvoted" depends on an array's length,
  // which MongoDB can't sort by directly without a more complex aggregation.
  if (sort === "top") {
    posts = posts.sort((a, b) => b.upvotes.length - a.upvotes.length);
  } else {
    posts = posts.sort((a, b) => b.createdAt - a.createdAt);
  }

  res.json(posts);
}

export async function createPost(req, res) {
  try {
    const { title, content, sourceUrl, group } = req.body;
    if (!title || !content || !group) {
      return res
        .status(400)
        .json({ error: "Title, content, and a community are required" });
    }

    const groupDoc = await Group.findById(group);
    if (!groupDoc) {
      return res.status(404).json({ error: "That community doesn't exist" });
    }

    const isMember = groupDoc.members.some(
      (id) => id.toString() === req.userId,
    );
    if (!isMember) {
      return res
        .status(403)
        .json({ error: "Join this community before posting" });
    }

    const post = await Post.create({
      title,
      content,
      sourceUrl,
      group,
      author: req.userId,
    });

    res.status(201).json(post);

    runFactCheck(title, content)
      .then(async (verdict) => {
        post.verdict = { ...verdict, checkedAt: new Date() };
        await post.save();
      })
      .catch((err) => {
        console.error("Fact-check failed for post", post._id, err.message);
      });
  } catch (err) {
    res.status(500).json({ error: "Failed to create post" });
  }
}

export async function upvotePost(req, res) {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });

  const alreadyUpvoted = post.upvotes.some(
    (id) => id.toString() === req.userId,
  );
  if (alreadyUpvoted) {
    post.upvotes = post.upvotes.filter((id) => id.toString() !== req.userId);
  } else {
    post.upvotes.push(req.userId);
  }
  await post.save();
  res.json({ upvoteCount: post.upvotes.length });
}
