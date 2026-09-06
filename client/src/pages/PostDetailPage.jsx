import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/client";
import VerdictStamp from "../components/VerdictStamp";
import CommentSection from "../components/CommentSection";
import "./PostDetailPage.css";

export default function PostDetailPage() {
  const { groupId, postId } = useParams();
  const [post, setPost] = useState(null);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  async function loadPost() {
    // The list endpoint already gives us everything we need; find this one post in it.
    const response = await api.get("/posts", { params: { group: groupId } });
    const found = response.data.find((p) => p._id === postId);
    setPost(found || null);
  }

  useEffect(() => {
    loadPost();
  }, [postId]);

  async function handleUpvote() {
    await api.post(`/posts/${postId}/upvote`);
    loadPost();
  }

  async function handleDelete() {
    if (!confirm("Delete this post? This can't be undone.")) return;
    await api.delete(`/posts/${postId}`);
    navigate(`/feed/${groupId}`);
  }

  if (!post) {
    return <div className="post-detail page-fade">Loading…</div>;
  }

  return (
    <div className="post-detail page-fade">
      <Link to={`/feed/${groupId}`} className="post-detail-back">
        ← back to feed
      </Link>

      <div className="post-detail-card">
        <p className="post-detail-byline">
          {post.author?.username || "unknown"} ·{" "}
          {new Date(post.createdAt).toLocaleDateString()}
        </p>
        <h1 className="post-detail-title">{post.title}</h1>

        {post.imageUrl && (
          <img src={post.imageUrl} alt="" className="post-detail-image" />
        )}

        <p className="post-detail-body">{post.content}</p>

        <div className="post-detail-actions">
          <button className="post-detail-vote" onClick={handleUpvote}>
            ▲ {post.upvotes?.length || 0}
          </button>
          <VerdictStamp status={post.verdict?.status} />
          {post.author?._id === userId && (
            <button className="post-detail-vote" onClick={handleDelete}>
              Delete
            </button>
          )}
        </div>

        {post.verdict?.reasoning && (
          <p className="post-detail-reasoning">{post.verdict.reasoning}</p>
        )}

        <CommentSection postId={post._id} currentUserId={userId} />
      </div>
    </div>
  );
}
