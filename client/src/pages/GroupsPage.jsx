import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import "./GroupsPage.css";

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const userId = localStorage.getItem("userId");

  async function loadGroups() {
    const response = await api.get("/groups");
    setGroups(response.data);
  }

  useEffect(() => {
    loadGroups();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/groups", { name, description });
      setName("");
      setDescription("");
      loadGroups();
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't create that community");
    }
  }

  async function handleJoin(groupId) {
    await api.post(`/groups/${groupId}/join`);
    loadGroups();
  }

  return (
    <div className="groups-page">
      <div className="groups-header">
        <div>
          <h1 className="groups-title">Communities</h1>
          <p className="groups-subtitle">verified facts wire</p>
        </div>
      </div>

      <form className="group-composer" onSubmit={handleCreate}>
        <input
          placeholder="Community name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <textarea
          placeholder="What's this community about?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
        {error && <p className="auth-error">{error}</p>}
        <button type="submit">Start a community</button>
      </form>

      {groups.map((group) => {
        const isMember = group.members?.includes(userId);
        return (
          <div className="group-card" key={group._id}>
            <div>
              <h3 className="group-card-name">{group.name}</h3>
              <p className="group-card-meta">
                {group.members?.length || 0} members
              </p>
              {group.description && (
                <p className="group-card-desc">{group.description}</p>
              )}
            </div>
            <div className="group-actions">
              {isMember ? (
                <Link className="primary" to={`/feed/${group._id}`}>
                  Open feed
                </Link>
              ) : (
                <button onClick={() => handleJoin(group._id)}>Join</button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
