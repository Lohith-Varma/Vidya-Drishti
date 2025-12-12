// frontend/src/components/HackerRankStatsCard.jsx
import React, { useEffect, useState } from "react";
import { getHackerRankStats } from "../api/hackerrank.api";

function HackerRankStatsCard({ username }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!username) return;

    setLoading(true);
    setError("");

    getHackerRankStats(username)
      .then((data) => setStats(data))
      .catch((err) => {
        console.error(err);
        setError("Could not load HackerRank stats");
      })
      .finally(() => setLoading(false));
  }, [username]);

  if (!username) return <p>No HackerRank username set.</p>;
  if (loading) return <p>Loading HackerRank stats...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!stats) return null;

  return (
    <div className="hackerrank-card">
      <h3>HackerRank ({stats.username})</h3>
      <ul>
        <li>Score: {stats.score}</li>
        <li>Rank: {stats.rank}</li>
        <li>Contests Played: {stats.contestsPlayed}</li>
        <li>Solved Challenges: {stats.solvedChallenges}</li>
        <li>Followers: {stats.followers}</li>
        <li>Following: {stats.following}</li>
      </ul>

      {stats.badges?.length > 0 && (
        <>
          <h4>Badges:</h4>
          <ul>
            {stats.badges.map((b) => (
              <li key={b.name}>
                {b.name} – {b.stars} ★
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default HackerRankStatsCard;
