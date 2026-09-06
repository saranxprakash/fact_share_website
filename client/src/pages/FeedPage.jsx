import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client";
import VerdictStamp from "../components/VerdictStamp";
import CommentSection from "../components/CommentSection";
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
          <button className="post-action-btn" onClick={handleLeave}>
            Leave community
          </button>
        )}
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
      ) : (
        <p className="feed-empty">
          Join this community to post. Head back to Communities to join.
        </p>
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
          No dispatches yet. Be the first to file one.
        </p>
      )}

      {posts.map((post) => (
        <div className="post-row" key={post._id}>
          <div className="vote-col">
            <button
              className="vote-arrow"
              onClick={() => handleUpvote(post._id)}
              aria-label="Upvote"
            >
              ▲
            </button>
            <span className="vote-count">{post.upvotes?.length || 0}</span>
          </div>

          <div className="post-main">
            <p className="post-byline">
              {post.author?.username || "unknown"} ·{" "}
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
            <h2 className="post-title">{post.title}</h2>
            <p className="post-body">{post.content}</p>

            <div className="post-footer">
              <VerdictStamp status={post.verdict?.status} />
              {post.author?._id === userId && (
                <button
                  className="post-action-btn"
                  onClick={() => handleDeletePost(post._id)}
                >
                  Delete
                </button>
              )}
            </div>

            {post.verdict?.reasoning && (
              <p className="post-reasoning">{post.verdict.reasoning}</p>
            )}

            <CommentSection postId={post._id} currentUserId={userId} />
          </div>

          {post.imageUrl && (
            <img src={post.imageUrl} alt="" className="post-thumb" />
          )}
        </div>
      ))}
    </div>
  );
}
