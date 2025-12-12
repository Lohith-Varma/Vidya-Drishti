import React from "react";
import "./AdminLeaderboard.css";

const AdminLeaderboard = ({ students = [] }) => {
  // Prevents blank page if wrong data is passed
  if (!Array.isArray(students)) {
    console.error("AdminLeaderboard Error: 'students' must be an array.");
    return <h2 style={{ textAlign: "center", marginTop: "50px" }}>Invalid Data</h2>;
  }

  return (
    <div className="admin-leaderboard-container">
      <h2 className="admin-title">Admin Leaderboard</h2>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Avatar</th>
            <th>Name</th>
            <th>Score</th>
          </tr>
        </thead>

        <tbody>
          {students.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
                No student data available
              </td>
            </tr>
          ) : (
            students.map((s, index) => (
              <tr key={s.id || index}>
                <td>
                  <span className="admin-rank-badge">{index + 1}</span>
                </td>

                <td>
                  <img
                    src={s.avatar || "https://via.placeholder.com/40"}
                    alt="avatar"
                    className="admin-avatar"
                  />
                </td>

                <td>{s.name || "Unknown"}</td>

                <td>{s.score ?? "0"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminLeaderboard;
