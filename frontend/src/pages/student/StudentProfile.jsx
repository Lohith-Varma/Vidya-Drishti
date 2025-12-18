import React, { useEffect, useState } from "react";
import "./StudentProfile.css";

import LeetCodeStatsCard from "../../components/LeetCodeStatsCard";
import HackerRankStatsCard from "../../components/HackerRankStatsCard";
import { getStudentProfile } from "../../api/student.api";

export default function StudentProfile() {
  const [student, setStudent] = useState(null);
  const [error, setError] = useState("");

  // TEMP: later this will come from logged-in user
  const email = "lohith@gmail.com";

  useEffect(() => {
    getStudentProfile(email)
      .then(setStudent)
      .catch(() => setError("Failed to load profile"));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!student) return <p>Loading profile...</p>;

  return (
    <div className="student-profile">
      <h3>{student.fullName}</h3>

      <div className="small-text">
        Edit profile, link handles (LeetCode/CF/GitHub), upload resume
      </div>

      <div className="profile-stats-grid">
        <LeetCodeStatsCard username={student.leetcodeUsername} />
        <HackerRankStatsCard username={student.hackerrankUsername} />
      </div>
    </div>
  );
}
