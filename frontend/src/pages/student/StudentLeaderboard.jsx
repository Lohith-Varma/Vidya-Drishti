import React from "react";
import "./StudentLeaderboard.css";

const StudentLeaderboard = ({ students = [] }) => {
  // Safety check — ensures no blank page
  if (!Array.isArray(students)) {
    console.error("StudentLeaderboard Error: 'students' must be an array.");
    return <h2 style={{ textAlign: "center", marginTop: "50px" }}>Invalid Data</h2>;
  }

  return (
    <div className="student-leaderboard-container">
      <h2 className="student-title">Student Leaderboard</h2>

      <table className="student-table">
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
                No student data found
              </td>
            </tr>
          ) : (
            students.map((s, index) => (
              <tr key={s.id || index}>
                <td>
                  <span className="student-rank-badge">{index + 1}</span>
                </td>

                <td>
                  <img
                    src={s.avatar || "https://via.placeholder.com/40"}
                    alt="avatar"
                    className="student-avatar"
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

export default StudentLeaderboard;
