import React from "react";
import "./Header.css";

export default function Header({ role, setRole }) {
  return (
    <div className="header">
      <div className="header-left">
        <select
          className="role-select"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="student">Student</option>
          <option value="admin">Teacher (Admin)</option>
        </select>
      </div>

      <div className="header-right">NSRIT • Vidya-Drishti</div>
    </div>
  );
}
