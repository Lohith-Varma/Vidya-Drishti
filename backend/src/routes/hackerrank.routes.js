// backend/routes/hackerrank.js
const express = require("express");
const axios = require("axios");

const router = express.Router();

// GET /api/hackerrank/:username
router.get("/:username", async (req, res) => {
  const { username } = req.params;

  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  try {
    const url = `https://www.hackerrank.com/rest/contests/master/hackers/${username}/profile`;

    const { data } = await axios.get(url, {
      timeout: 10000,
      headers: {
        // mimic a browser to avoid being blocked
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
      },
    });

    if (!data || !data.model) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const m = data.model;

    const stats = {
      username,
      country: m.country || null,
      score: m.score || 0,
      rank: m.rank || null,
      contestsPlayed: m.contests_played || 0,
      solvedChallenges: m.solved_challenges || 0,
      followers: m.followers_count || 0,
      following: m.following_count || 0,
      badges: (m.badges || []).map((b) => ({
        name: b.name,
        stars: b.stars,
      })),
    };

    res.json(stats);
  } catch (err) {
    console.error("HackerRank stats error:", err.message);
    res.status(500).json({ message: "Server error fetching HackerRank stats" });
  }
});

module.exports = router;
