import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client";
import VerdictStamp from "../components/VerdictStamp";
import CommentSection from "../components/CommentSection";
import "./FeedPage.css";

export default function FeedPage() {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [sort, setSort] = useState("new");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const userId = localStorage.getItem("userId");

  async function loadGroup() {
    const response = await api.get(`/groups/${groupId}`);
    setGroup(response.data);
  }

  async function loadPosts(currentSort = sort) {
    const response = await api.get("/posts", {
      params: { group: groupId, sort: currentSort },
    });
    setPosts(response.data);
  }

  useEffect(() => {
    loadGroup();
    loadPosts();
  }, [groupId]);

  function handleSortChange(newSort) {
    setSort(newSort);
    loadPosts(newSort);
  }

  async function handleLeave() {
    await api.post(`/groups/${groupId}/leave`);
    window.location.href = "/groups";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/posts", { title, content, group: groupId });
      setTitle("");
      setContent("");
      loadPosts();
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't post that. Try again.");
    }
  }

  async function handleUpvote(postId) {
    await api.post(`/posts/${postId}/upvote`);
    loadPosts();
  }

  async function handleDeletePost(postId) {
    if (!confirm("Delete this post? This can't be undone.")) return;
    await api.delete(`/posts/${postId}`);
    loadPosts();
  }

  const isMember = group?.members?.includes(userId);

  return (
    <div className="feed-page">
      <div className="feed-header">
        <div>
          <Link to="/groups" className="feed-subtitle">
            ← all communities
          </Link>
          <h1 className="feed-title">{group?.name || "Loading…"}</h1>
        </div>
        {isMember && (
          <button className="upvote-btn" onClick={handleLeave}>
            Leave community
          </button>
        )}
      </div>

      <div className="sort-toggle">
        <button
          className={sort === "new" ? "active" : ""}
          onClick={() => handleSortChange("new")}
        >
          Newest
        </button>
        <button
          className={sort === "top" ? "active" : ""}
          onClick={() => handleSortChange("top")}
        >
          Top
        </button>
      </div>

      {isMember ? (
        <form className="composer" onSubmit={handleSubmit}>
          <input
            placeholder="Headline"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="What's the claim?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            required
          />
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="composer-submit">
            Send to the wire
          </button>
        </form>
      ) : (
        <p className="feed-empty">
          Join this community to post. Head back to Communities to join.
        </p>
      )}

      {posts.length === 0 && (
        <p className="feed-empty">
          No dispatches yet. Be the first to file one.
        </p>
      )}

      {posts.map((post) => (
        <article className="dispatch" key={post._id}>
          <p className="dispatch-byline">
            {post.author?.username || "unknown"} · filed{" "}
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
          <h2 className="dispatch-title">{post.title}</h2>
          <p className="dispatch-body">{post.content}</p>

          <div className="dispatch-footer">
            <VerdictStamp status={post.verdict?.status} />
            <button
              className="upvote-btn"
              onClick={() => handleUpvote(post._id)}
            >
              ▲ {post.upvotes?.length || 0}
            </button>
            {post.author?._id === userId && (
              <button
                className="upvote-btn"
                onClick={() => handleDeletePost(post._id)}
              >
                Delete
              </button>
            )}
          </div>

          {post.verdict?.reasoning && (
            <p className="dispatch-reasoning">{post.verdict.reasoning}</p>
          )}

          <CommentSection postId={post._id} currentUserId={userId} />
        </article>
      ))}
    </div>
  );
}
