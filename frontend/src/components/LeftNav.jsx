import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiBarChart2,
  FiUsers,
  FiExternalLink,
  FiUser,
  FiAward,
} from "react-icons/fi";
import "./LeftNav.css";

export default function LeftNav({ role }) {
  const location = useLocation();

  const adminMenu = [
    { label: "Home", path: "/admin/home", icon: <FiHome /> },
    { label: "Analytics", path: "/admin/analytics", icon: <FiBarChart2 /> },
    { label: "Leader Board", path: "/admin/leaderboard", icon: <FiUsers /> },
    { label: "Coding Profiles", path: "/admin/coding-profiles", icon: <FiExternalLink /> },
  ];

  const studentMenu = [
    { label: "Home", path: "/student/home", icon: <FiHome /> },
    { label: "My Analytics", path: "/student/analytics", icon: <FiBarChart2 /> },
    { label: "Leaderboard", path: "/student/leaderboard", icon: <FiAward /> },
    { label: "Coding Profiles", path: "/student/coding-profiles", icon: <FiExternalLink /> },
  ];

  const account = [
    { label: "Profile", path: "/profile", icon: <FiUser /> },
  ];

  const menu = role === "admin" ? adminMenu : studentMenu;

  return (
    <nav className="leftNav">
      <div className="menuWrapper">
        <div className="sectionLabel">Main</div>
        {menu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`navItem ${location.pathname === item.path ? "active" : ""}`}
          >
            <span className="icon">{item.icon}</span>
            <span className="label">{item.label}</span>
          </Link>
        ))}

        <div className="sectionLabel">Account</div>
        {account.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="navItem"
          >
            <span className="icon">{item.icon}</span>
            <span className="label">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
