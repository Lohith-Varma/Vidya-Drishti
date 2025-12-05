import React from "react";
import { Link } from "react-router-dom";
import LogoImg from "../assets/vidya-drishti-logo.png";
import "./LeftNav.css";

export default function LeftNav({ role }) {
  const studentLinks = [
    { to: "/", label: "Home", icon: "" },
    { to: "/student/assessments", label: "Assessments", icon: "" },
    { to: "/student/leaderboard", label: "Leaderboard", icon: "" },
    { to: "/student/profile", label: "Profile", icon: "" },
  ];

  const adminLinks = [
    { to: "/", label: "Home", icon: "" },
    { to: "/teacher/create", label: "Create Assessment", icon: "" },
    { to: "/teacher/analytics", label: "Analytics", icon: "" },
    { to: "/teacher/leaderboard", label: "Leader Board", icon: "" },
    { to: "/teacher/profile", label: "Profile", icon: "" },
  ];

  const links = role === "admin" ? adminLinks : studentLinks;

  return (
    <aside className={`leftnav `}>
      {/* Top: Logo / Brand */}
      <div className="leftnav-top">
        <div className="logo">
          <img src={LogoImg} alt="Vidya Drishti Logo" className="logo" />
        </div>
      </div>

      {/* Middle: nav + toggle button */}
      <div>
        <nav className="nav">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className="nav-link">
              <span className="nav-icon">
                {link.icon}
              </span>
              <span className="nav-label">{link.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom profile section */}
      <div className="leftnav-bottom">
        <img
          src="https://api.dicebear.com/6.x/identicon/svg?seed=Vidya"
          alt="avatar"
          className="avatar"
        />
        <div>
            <div className="profile-name">Prof. V S R Murthy</div>
            <div className="profile-email">vsrmurthy@nsrit.edu.in</div>
        </div>
      </div>
    </aside>
  );
}

