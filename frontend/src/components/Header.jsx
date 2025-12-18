import React from "react";
import "./Header.css";

export default function Header({ role, setRole }) {
  return (
    <div className="header">

      {/* <div className="header-left">
        <select
          className="role-select"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="student">Student</option>
          <option value="admin">Teacher (Admin)</option>
        </select>
      </div> */}

      <div className="role-switch">
          <button
            className={`role-btn ${role === "student" ? "active" : ""}`}
            onClick={() => {
              setRole("student");
              localStorage.setItem("role", "student");
            }}
          >
            Student
          </button>

          <button
            className={`role-btn ${role === "admin" ? "active" : ""}`}
            onClick={() => {
              setRole("admin");
              localStorage.setItem("role", "admin");
            }}
          >
            Admin
          </button>
        </div>

      <div className="header-right">NSRIT • Vidya-Drishti</div>
    </div>
  );
}
