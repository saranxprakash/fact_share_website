import { useState } from "react";
import api from "../api/client";
import "./CommentSection.css";

export default function CommentSection({ postId, currentUserId }) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [text, setText] = useState("");

  async function loadComments() {
    const response = await api.get(`/comments/${postId}`);
    setComments(response.data);
    setLoaded(true);
  }

  function handleToggle() {
    const next = !open;
    setOpen(next);
    if (next && !loaded) loadComments();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    await api.post(`/comments/${postId}`, { content: text });
    setText("");
    loadComments();
  }

  async function handleDelete(commentId) {
    await api.delete(`/comments/${commentId}`);
    loadComments();
  }

  return (
    <div className="comments">
      <button className="comments-toggle" onClick={handleToggle}>
        {open ? "Hide comments" : `View comments (${comments.length || ""})`}
      </button>

      {open && (
        <>
          <div className="comment-list">
            {comments.length === 0 && loaded && (
              <p className="comment-text" style={{ color: "var(--ink-soft)" }}>
                No comments yet.
              </p>
            )}
            {comments.map((c) => (
              <div className="comment-item" key={c._id}>
                <div>
                  <p className="comment-byline">
                    {c.author?.username || "unknown"}
                  </p>
                  <p className="comment-text">{c.content}</p>
                </div>
                {c.author?._id === currentUserId && (
                  <button
                    className="comment-delete"
                    onClick={() => handleDelete(c._id)}
                  >
                    delete
                  </button>
                )}
              </div>
            ))}
          </div>

          <form className="comment-form" onSubmit={handleSubmit}>
            <input
              placeholder="Add a comment"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button type="submit">Reply</button>
          </form>
        </>
      )}
    </div>
  );
}
