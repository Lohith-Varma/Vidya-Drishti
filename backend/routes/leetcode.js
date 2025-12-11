// backend/routes/leetcode.js
const express = require("express");
const axios = require("axios");

const router = express.Router();

// GET /api/leetcode/:username
router.get("/:username", async (req, res) => {
  const { username } = req.params;

  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  try {
    // community LeetCode stats API (unofficial)
    const url = `https://leetcode-stats-api.herokuapp.com/${username}`;

    const { data } = await axios.get(url, { timeout: 10000 });

    if (data.status !== "success") {
      return res.status(400).json({
        message: data.message || "Unable to fetch LeetCode stats",
      });
    }

    const stats = {
      username,
      totalSolved: data.totalSolved,
      easySolved: data.easySolved,
      mediumSolved: data.mediumSolved,
      hardSolved: data.hardSolved,
      acceptanceRate: data.acceptanceRate,
      ranking: data.ranking,
    };

    res.json(stats);
  } catch (err) {
    console.error("LeetCode stats error:", err.message);
    res.status(500).json({ message: "Server error fetching LeetCode stats" });
  }
});

module.exports = router;
