import { useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api/client";
import "./AppShell.css";

export default function AppShell() {
  const [myGroups, setMyGroups] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    async function load() {
      const response = await api.get("/groups");
      setMyGroups(response.data.filter((g) => g.members?.includes(userId)));
    }
    load();
  }, [location.pathname]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    navigate("/");
  }

  const initial = username ? username[0].toUpperCase() : "?";

  return (
    <div className="shell">
      <aside className="shell-sidebar">
        <p className="shell-logo">Verified Facts Wire</p>
        <p className="shell-logo-sub">community fact-checking</p>

        <Link
          to="/groups"
          className={`shell-nav-link ${location.pathname === "/groups" ? "active" : ""}`}
        >
          Discover communities
        </Link>

        <p className="shell-section-label">Your communities</p>
        {myGroups.length === 0 && (
          <p className="shell-empty">Join a community to see it here.</p>
        )}
        {myGroups.map((g) => (
          <Link
            key={g._id}
            to={`/feed/${g._id}`}
            className={`shell-community-link ${
              location.pathname === `/feed/${g._id}` ? "active" : ""
            }`}
          >
            <span className="shell-community-dot" aria-hidden="true" />
            {g.name}
          </Link>
        ))}
      </aside>

      <div className="shell-main">
        <div className="shell-topbar">
          <div className="shell-profile">
            <button
              className="shell-profile-btn"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span className="shell-avatar">{initial}</span>
              {username}
            </button>
            {menuOpen && (
              <div className="shell-profile-menu">
                <Link to="/profile" onClick={() => setMenuOpen(false)}>
                  Profile
                </Link>
                <button onClick={handleLogout}>Log out</button>
              </div>
            )}
          </div>
        </div>

        <div className="shell-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
