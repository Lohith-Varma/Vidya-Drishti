import React from "react";
import { Link, useLocation } from "react-router-dom";
import LogoImg from "../assets/vidya-drishti-logo.png";
import {
  HiOutlineHome,
  HiOutlineClipboardDocumentList,
  HiOutlineChartBar,
  HiOutlineStar,
  HiOutlineUser,
} from "react-icons/hi2";

import "./LeftNav.css";

export default function LeftNav({ role }) {
  const { pathname } = useLocation();

  const studentLinks = [
  { to: "/", label: "Home", icon: <HiOutlineHome /> },
  { to: "/student/assessments", label: "Assessments", icon: <HiOutlineClipboardDocumentList /> },
  { to: "/student/leaderboard", label: "Leaderboard", icon: <HiOutlineStar /> },
  { to: "/student/profile", label: "Profile", icon: <HiOutlineUser /> },
];

const adminLinks = [
  { to: "/", label: "Home", icon: <HiOutlineHome /> },
  { to: "/admin/create", label: "Create Assessment", icon: <HiOutlineClipboardDocumentList /> },
  { to: "/admin/analytics", label: "Analytics", icon: <HiOutlineChartBar /> },
  { to: "/admin/leaderboard", label: "Leader Board", icon: <HiOutlineStar /> },
  { to: "/admin/profile", label: "Profile", icon: <HiOutlineUser /> },
];


  const links = role === "admin" ? adminLinks : studentLinks;

  return (
    <aside className="leftnav">
      {/* Top: Logo */}
      <div className="leftnav-top">
        <div className="logo">
          <img src={LogoImg} alt="Vidya Drishti Logo" />
        </div>
      </div>

      {/* Scrollable sidebar menu */}
      <div className="leftnav-scroll">
       <nav className="nav">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className="nav-link">
              <span className="nav-icon">{link.icon}</span>
              <span className="nav-label">{link.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom: Profile */}
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
