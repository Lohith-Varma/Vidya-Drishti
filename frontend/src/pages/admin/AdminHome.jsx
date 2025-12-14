import React, { useEffect, useState } from "react";
import "./AdminHome.css";

export default function AdminHome() {
  const [stats, setStats] = useState({
    activeTests: 3,
    avgScore: 71,
    submissionsToday: 42,
    topStudent: "Gnana Deep"
  });

  const [submissions, setSubmissions] = useState([
    { name: "Lohith", assessment: "Weekly: Graphs", score: 82 },
    { name: "Siddhartha", assessment: "Mock: DP", score: 68 },
    { name: "Gnana Deep", assessment: "College Test", score: 91 }
  ]);

  return (
    <div className="adminHome">

      {/* HEADER */}
      <div className="homeHeader">
        <h1>Welcome back, Prof. V S R Murthy 👋</h1>
        <p>CSE Dept • NSRIT</p>
      </div>

      {/* KPI CARDS */}
      <div className="kpiGrid">
        <div className="kpiCard">
          <span className="kpiLabel">Active Assessments</span>
          <span className="kpiValue">{stats.activeTests}</span>
        </div>

        <div className="kpiCard">
          <span className="kpiLabel">Average Class Score</span>
          <span className="kpiValue">{stats.avgScore}%</span>
        </div>

        <div className="kpiCard">
          <span className="kpiLabel">Submissions Today</span>
          <span className="kpiValue">{stats.submissionsToday}</span>
        </div>

        <div className="kpiCard highlight">
          <span className="kpiLabel">Top Performer</span>
          <span className="kpiValue">{stats.topStudent}</span>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="homeGrid">

        {/* TABLE */}
        <div className="card">
          <h3>Recent Submissions</h3>
          <table className="homeTable">
            <thead>
              <tr>
                <th>Name</th>
                <th>Assessment</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s, i) => (
                <tr key={i}>
                  <td>{s.name}</td>
                  <td>{s.assessment}</td>
                  <td className="score">{s.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* QUICK ACTIONS */}
        <div className="card quickActions">
          <h3>Quick Actions</h3>

          <button className="actionBtn primary">
            ➕ Create New Assessment
          </button>

          <button className="actionBtn">
            📊 View Analytics
          </button>

          <button className="actionBtn">
            💻 Coding Profiles
          </button>
        </div>
      </div>
    </div>
  );
}
