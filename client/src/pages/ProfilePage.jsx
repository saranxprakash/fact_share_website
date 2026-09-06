import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import VerdictStamp from "../components/VerdictStamp";
import "./ProfilePage.css";

export default function ProfilePage() {
  const [groups, setGroups] = useState([]);
  const [posts, setPosts] = useState([]);
  const username = localStorage.getItem("username");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    async function load() {
      const [groupsRes, postsRes] = await Promise.all([
        api.get("/groups"),
        api.get("/posts/mine"),
      ]);
      setGroups(groupsRes.data.filter((g) => g.members?.includes(userId)));
      setPosts(postsRes.data);
    }
    load();
  }, []);

  const initial = username ? username[0].toUpperCase() : "?";

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">{initial}</div>
        <div>
          <h1 className="profile-name">{username}</h1>
          <p className="profile-meta">{posts.length} dispatches filed</p>
        </div>
      </div>

      <h2 className="profile-section-title">Your communities</h2>
      <div className="profile-groups">
        {groups.length === 0 && (
          <p className="profile-meta">
            You haven't joined any communities yet.
          </p>
        )}
        {groups.map((g) => (
          <Link
            key={g._id}
            to={`/feed/${g._id}`}
            className="profile-group-chip"
          >
            {g.name}
          </Link>
        ))}
      </div>

      <h2 className="profile-section-title">Your dispatches</h2>
      {posts.length === 0 && (
        <p className="profile-meta">You haven't posted anything yet.</p>
      )}
      {posts.map((post) => (
        <div className="profile-post" key={post._id}>
          <p className="profile-post-meta">
            {post.group?.name || "unknown community"} ·{" "}
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
          <h3 className="profile-post-title">{post.title}</h3>
          <VerdictStamp status={post.verdict?.status} />
        </div>
      ))}
    </div>
  );
}
