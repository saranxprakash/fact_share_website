import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client";
import ImageUpload from "../components/ImageUpload";
import "./FeedPage.css";

export default function FeedPage() {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [sort, setSort] = useState("new");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [showComposer, setShowComposer] = useState(false);
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
      await api.post("/posts", { title, content, imageUrl, group: groupId });
      setTitle("");
      setContent("");
      setImageUrl("");
      setShowComposer(false);
      loadPosts();
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't post that. Try again.");
    }
  }

  async function handleUpvote(e, postId) {
    e.preventDefault();
    e.stopPropagation();
    await api.post(`/posts/${postId}/upvote`);
    loadPosts();
  }

  const isMember = group?.members?.includes(userId);

  return (
    <div className="feed-page page-fade">
      <div className="feed-header">
        <div>
          <Link to="/groups" className="feed-subtitle">
            ← all communities
          </Link>
          <h1 className="feed-title">{group?.name || "Loading…"}</h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {isMember && (
            <button
              className="sort-toggle button"
              style={{
                borderRadius: 16,
                border: "1px solid var(--rule)",
                background: "var(--paper)",
                padding: "6px 14px",
                fontSize: 13,
              }}
              onClick={() => setShowComposer(!showComposer)}
            >
              {showComposer ? "Cancel" : "+ New article"}
            </button>
          )}
        </div>
      </div>

      {!isMember && (
        <p className="feed-empty">
          Join this community to post. Head back to Communities to join.
        </p>
      )}

      {isMember && showComposer && (
        <form className="composer" onSubmit={handleSubmit}>
          <input
            placeholder="Headline"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Write your article..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            required
          />
          <ImageUpload
            imageUrl={imageUrl}
            onUploaded={setImageUrl}
            onRemove={() => setImageUrl("")}
          />
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="composer-submit">
            Publish
          </button>
        </form>
      )}

      <div className="sort-toggle">
        <button
          className={sort === "new" ? "active" : ""}
          onClick={() => handleSortChange("new")}
        >
          New
        </button>
        <button
          className={sort === "top" ? "active" : ""}
          onClick={() => handleSortChange("top")}
        >
          Top
        </button>
      </div>

      {posts.length === 0 && (
        <p className="feed-empty">
          No articles yet. Be the first to publish one.
        </p>
      )}

      {posts.map((post) => (
        <Link
          className="post-row"
          key={post._id}
          to={`/feed/${groupId}/post/${post._id}`}
        >
          <div className="vote-col">
            <button
              className="vote-arrow"
              onClick={(e) => handleUpvote(e, post._id)}
              aria-label="Upvote"
            >
              ▲
            </button>
            <span className="vote-count">{post.upvotes?.length || 0}</span>
          </div>

          <h2 className="post-title">{post.title}</h2>

          {post.imageUrl && (
            <img src={post.imageUrl} alt="" className="post-thumb" />
          )}
        </Link>
      ))}
    </div>
  );
}
