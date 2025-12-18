import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiBarChart2,
  FiUsers,
  FiExternalLink,
  FiUser,
  FiExternalLink,
  FiBookOpen,
} from "react-icons/fi";
import "./LeftNav.css";

export default function LeftNav({ role }) {
export default function LeftNav({ role }) {
  const location = useLocation();

  // ADMIN MENUS
  const adminMain = [
    { label: "Home", path: "/admin/home", icon: <FiHome /> },
    { label: "Create Assessment", path: "/admin/create", icon: <FiPlusCircle /> },
    { label: "Analytics", path: "/admin/analytics", icon: <FiBarChart2 /> },
    { label: "Leaderboard", path: "/admin/leaderboard", icon: <FiUsers /> },
  ];

  const adminTools = [
    { label: "Coding Profiles", path: "/admin/coding-profiles", icon: <FiExternalLink /> },
  ];

  const adminAccount = [
    { label: "Profile", path: "/admin/profile", icon: <FiUser /> },
  ];

  // STUDENT MENUS
  const studentMain = [
    { label: "Home", path: "/", icon: <FiHome /> },
    { label: "Assessments", path: "/student/assessments", icon: <FiBookOpen /> },
    { label: "Leaderboard", path: "/student/leaderboard", icon: <FiUsers /> },
  ];

  const studentAccount = [
    { label: "Profile", path: "/student/profile", icon: <FiUser /> },
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
        {role === "admin" && (
          <>
            {renderSection("Main", adminMain)}
            {renderSection("Student Tools", adminTools)}
            {renderSection("Account", adminAccount)}
          </>
        )}

        {role === "student" && (
          <>
            {renderSection("Main", studentMain)}
            {renderSection("Account", studentAccount)}
          </>
        )}
      </div>
    </nav>
  );
}
