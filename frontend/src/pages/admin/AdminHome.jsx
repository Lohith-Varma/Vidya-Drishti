import React from "react";
import "./AdminHome.css";

export default function AdminHome() {
  return (
    <div className="adminHome">
      {/* HEADER */}
      <div className="pageHeader">
        <h1>Welcome back, Prof. V S R Murthy 👋</h1>
        <p>CSE Dept • NSRIT</p>
      </div>

      {/* STATS */}
      <div className="statsRow">
        <StatCard title="Active Assessments" value="3 ongoing" />
        <StatCard title="Average Class Score" value="71%" />
        <StatCard title="Create Assessment" value="Quick link to create test" />
      </div>

      {/* GRID */}
      <div className="grid">
        <div className="card large">
          <h3>Recent Submissions</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Assessment</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Lohith</td><td>Weekly: Graphs</td><td>82</td></tr>
              <tr><td>Siddhartha</td><td>Mock: DP</td><td>68</td></tr>
              <tr><td>Gnana Deep</td><td>College Test</td><td>91</td></tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3>Top Students</h3>
          <p>Vikram • Rohit • Anita</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="statCard">
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}
