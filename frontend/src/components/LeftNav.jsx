import React from "react";
import { Link } from "react-router-dom";
import "./LeftNav.css";

export default function LeftNav({ collapsed, setCollapsed, role }) {
  const studentLinks = [
    { to: "/", label: "Home", icon: "🏠" },
    { to: "/student/assessments", label: "Assessments", icon: "🧩" },
    { to: "/student/leaderboard", label: "Leaderboard", icon: "🏆" },
    { to: "/student/profile", label: "Profile", icon: "👤" },
  ];

  const adminLinks = [
    { to: "/", label: "Home", icon: "🏠" },
    { to: "/teacher/create", label: "Create Assessment", icon: "➕" },
    { to: "/teacher/analytics", label: "Analytics", icon: "📈" },
    { to: "/teacher/profile", label: "Profile", icon: "👤" },
  ];

  const links = role === "admin" ? adminLinks : studentLinks;

  return (
    <aside className={`leftnav ${collapsed ? "collapsed" : "expanded"}`}>
      <div className="leftnav-top">
        <div className="brand">
          <div className="logo">V</div>
          {!collapsed && <div className="brand-title">Vidya-Drishti</div>}
        </div>

        <button className="toggle-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? "▶" : "◀"} Toggle
        </button>

        <nav className="nav">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="nav-link">
              <span className="nav-icon">{l.icon}</span>
              {!collapsed && <span className="nav-text">{l.label}</span>}
            </Link>
          ))}
        </nav>
      </div>

      <div className="leftnav-bottom">
        <img
          src="https://api.dicebear.com/6.x/identicon/svg?seed=Vidya"
          alt="avatar"
          className="avatar"
        />
        {!collapsed && (
          <div className="profile-meta">
            <div className="profile-name">Prof. Mehta</div>
            <div className="profile-email">mehta@nsrit.edu</div>
          </div>
        )}
      </div>
    </aside>
  );
}
