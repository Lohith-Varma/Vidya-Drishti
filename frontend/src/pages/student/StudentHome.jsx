import React from "react";
import "./StudentHome.css";

export default function StudentHome() {
  return (
    <div className="studentHome">
      <div className="studentHeader">
        <h1>Welcome back 👋</h1>
        <p>Your coding journey starts here.</p>
      </div>

      <div className="studentStats">
        <Stat label="Problems Solved" value="124" />
        <Stat label="Average Score" value="76%" />
        <Stat label="Assessments" value="12" />
        <Stat label="Leaderboard Rank" value="#18" />
      </div>

      <div className="studentGrid">
        <div className="card">
          <h3>Performance Analytics</h3>
          <div className="placeholder">📊 Charts will appear here</div>
        </div>

        <div className="card">
          <h3>Quick Actions</h3>
          <button className="actionBtn primary">➕ Add Coding Profile</button>
          <button className="actionBtn">🏆 View Leaderboard</button>
          <button className="actionBtn">📈 Full Analytics</button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="statCard">
      <span className="statLabel">{label}</span>
      <span className="statValue">{value}</span>
    </div>
  );
}
