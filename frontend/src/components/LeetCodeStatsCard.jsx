// frontend/src/components/LeetCodeStatsCard.jsx
import React, { useEffect, useState } from "react";
import { getLeetCodeStats } from "../api/leetcode.api";

function LeetCodeStatsCard({ username }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!username) return;

    setLoading(true);
    setError("");

    getLeetCodeStats(username)
      .then((data) => setStats(data))
      .catch((err) => {
        console.error(err);
        setError("Could not load LeetCode stats");
      })
      .finally(() => setLoading(false));
  }, [username]);

  if (!username) return <p>No LeetCode username set.</p>;
  if (loading) return <p>Loading LeetCode stats...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!stats) return null;

  return (
    <div className="leetcode-card">
      <h3>LeetCode ({stats.username})</h3>
      <ul>
        <li>Total solved: {stats.totalSolved}</li>
        <li>Easy: {stats.easySolved}</li>
        <li>Medium: {stats.mediumSolved}</li>
        <li>Hard: {stats.hardSolved}</li>
        <li>Acceptance: {stats.acceptanceRate}%</li>
        <li>Global Rank: {stats.ranking}</li>
      </ul>
    </div>
  );
}

export default LeetCodeStatsCard;
