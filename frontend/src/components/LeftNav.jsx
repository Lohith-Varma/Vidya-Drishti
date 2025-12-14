import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiPlusCircle,
  FiBarChart2,
  FiUsers,
  FiUser,
  FiExternalLink
} from "react-icons/fi";
import "./LeftNav.css";

export default function LeftNav() {
  const location = useLocation();

  const menu = [
    { label: "Home", path: "/admin/home", icon: <FiHome /> },
    { label: "Create Assessment", path: "/admin/create-assessment", icon: <FiPlusCircle /> },
    { label: "Analytics", path: "/admin/analytics", icon: <FiBarChart2 /> },
    { label: "Leader Board", path: "/admin/leaderboard", icon: <FiUsers /> },
  ];

  const studentTools = [
    { label: "Coding Profiles", path: "/admin/coding-profiles", icon: <FiExternalLink /> },
  ];

  const account = [
    { label: "Profile", path: "/admin/profile", icon: <FiUser /> },
  ];

  const renderSection = (title, items) => (
    <>
      <div className="sectionLabel">{title}</div>
      {items.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`navItem ${location.pathname === item.path ? "active" : ""}`}
        >
          <span className="icon">{item.icon}</span>
          <span className="label">{item.label}</span>
        </Link>
      ))}
    </>
  );

  return (
    <nav className="leftNav" aria-label="Main navigation">
      <div className="menuWrapper">
        {renderSection("Main", menu)}
        {renderSection("Student Tools", studentTools)}
        {renderSection("Account", account)}
      </div>
    </nav>
  );
}
