import React from "react";
import "./AdminHome.css";
import Card from "../../components/Card";

export default function AdminHome() {
  return (
    <div className="admin-home">
      <div className="admin-header">
        <h2>Welcome back, Prof. Mehta</h2>
        <div className="meta small-text">CS Dept • NSRIT</div>
      </div>

      <div className="admin-grid">
        <div className="admin-left">
          <div className="two-cards">
            <Card title="Active Assessments">3 ongoing</Card>
            <Card title="Average Class Score">71%</Card>
          </div>

          <div className="card submissions">
            <h3>Recent submissions summary</h3>
            <table className="table">
              <thead>
                <tr><th>Name</th><th>Assessment</th><th>Score</th></tr>
              </thead>
              <tbody>
                <tr><td>Rohit</td><td>Weekly: Graphs</td><td>82</td></tr>
                <tr><td>Anita</td><td>Mock: DP</td><td>68</td></tr>
                <tr><td>Vikram</td><td>College Test</td><td>91</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-right">
          <Card title="Create Assessment">Quick link to create a new timed test</Card>
          <Card title="Top Students">Vikram • Rohit • Anita</Card>
        </div>
      </div>
    </div>
  );
}
