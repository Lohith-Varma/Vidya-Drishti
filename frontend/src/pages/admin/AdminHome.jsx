import React from "react";
import "./AdminHome.css";
import Card from "../../components/Card";

export default function AdminHome() {
  return (
    <div className="adminHome">

      {/* Header Section */}
      <div className="adminHeader">
        <div>
          <h1 className="pageTitle">Welcome back, Prof. V S R Murthy 👋</h1>
          <p className="subMeta">CSE Dept • NSRIT</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="dashboardGrid">

        {/* LEFT SECTION */}
        <div className="leftSection">

          {/* Stats Cards */}
          <div className="statsRow">
            <Card title="Active Assessments">
              <span className="statValue">3 ongoing</span>
            </Card>

            <Card title="Average Class Score">
              <span className="statValue">71%</span>
            </Card>
          </div>

          {/* Recent Submissions */}
          <div className="card submissionsCard">
            <h2 className="sectionTitle">Recent Submissions</h2>

            <table className="styledTable">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Assessment</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Lohith</td>
                  <td>Weekly: Graphs</td>
                  <td className="score">82</td>
                </tr>
                <tr>
                  <td>Siddhartha</td>
                  <td>Mock: DP</td>
                  <td className="score">68</td>
                </tr>
                <tr>
                  <td>Gnana Deep</td>
                  <td>College Test</td>
                  <td className="score">91</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="rightSection">
          <Card title="Create Assessment">
            <p className="hintText">Click to create a new timed test →</p>
          </Card>

          <Card title="Top Students">
            <p className="hintText">Vikram • Rohit • Anita</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
