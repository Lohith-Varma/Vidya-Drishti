import React from "react";
import "./StudentHome.css";
import Card from "../../components/StatCard";

export default function StudentHome() {
  return (
    <div className="student-home">
      <div className="student-header">
        <h2>Hi, Richard 👋</h2>
        <div className="meta small-text">Batch: 2026 • CS</div>
      </div>

      <div className="student-grid">
        <div className="left">
          <div className="two-cards">
            <Card title="Overall Score">87 / 100</Card>
            <Card title="Placement Readiness">Strong</Card>
          </div>

          <div className="card">
            <h3 style={{marginTop:0}}>Recent submissions</h3>
            <ul style={{listStyle:"none",padding:0,margin:0}}>
              <li style={{display:"flex",justifyContent:"space-between", padding:"8px 0"}}>Binary Search — LeetCode <span className="small-text">Accepted</span></li>
              <li style={{display:"flex",justifyContent:"space-between", padding:"8px 0"}}>DP — College Test <span className="small-text">Partial</span></li>
              <li style={{display:"flex",justifyContent:"space-between", padding:"8px 0"}}>Graph Theory — CodeChef <span className="small-text">WA</span></li>
            </ul>
          </div>
        </div>

        <div className="right">
          <Card title="Upcoming Assessments">No active tests</Card>
          <Card title="Suggested Problems">Arrays: 3 • DP: 2</Card>
          <Card title="Leaderboard Position">#8 / 120</Card>
        </div>
      </div>
    </div>
  );
}
