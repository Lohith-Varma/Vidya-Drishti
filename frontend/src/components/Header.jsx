import React from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";

export default function Header({ role, setRole }) {
  const navigate = useNavigate();

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setRole(newRole);
    navigate(newRole === "admin" ? "/admin/home" : "/student/home");
  };

  return (
    <div className="header">
      <div className="header-left">
        <select
          className="role-select"
          value={role}
          onChange={handleRoleChange}
        >
          <option value="student">Student</option>
          <option value="admin">Teacher (Admin)</option>
        </select>
      </div>

      <div className="header-right">NSRIT • Vidya-Drishti</div>
    </div>
  );
}
