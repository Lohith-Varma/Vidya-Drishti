// // backend/routes/leetcode.js
// const express = require("express");
// const axios = require("axios");

// const router = express.Router();

// // GET /api/leetcode/:username
// router.get("/:username", async (req, res) => {
//   const { username } = req.params;

//   if (!username) {
//     return res.status(400).json({ message: "Username is required" });
//   }

//   try {
//     // community LeetCode stats API (unofficial)
//     const url = `https://leetcode-stats-api.herokuapp.com/${username}`;

//     const { data } = await axios.get(url, { timeout: 10000 });

//     if (data.status !== "success") {
//       return res.status(400).json({
//         message: data.message || "Unable to fetch LeetCode stats",
//       });
//     }

//     const stats = {
//       username,
//       totalSolved: data.totalSolved,
//       easySolved: data.easySolved,
//       mediumSolved: data.mediumSolved,
//       hardSolved: data.hardSolved,
//       acceptanceRate: data.acceptanceRate,
//       ranking: data.ranking,
//     };

//     res.json(stats);
//   } catch (err) {
//     console.error("LeetCode stats error:", err.message);
//     res.status(500).json({ message: "Server error fetching LeetCode stats" });
//   }
// });

// module.exports = router;











const express = require('express')
const router = express.Router()
const authMiddleware = require('../src/middleware/authMiddleware')
const codingStatsService = require('../src/services/codingStatsService')
const prisma = require('../src/prismaClient')

// GET /api/integrations/leetcode/:username
router.get('/:username', authMiddleware, async (req, res) => {
  try {
    const { username } = req.params
    if (!username || username === 'undefined') {
      return res.status(400).json({ message: 'Username is required.' })
    }
    const stats = await codingStatsService.getLeetCodeStats(username)
    res.json(stats)
  } catch (error) {
    res.status(502).json({ message: error.message || 'Failed to fetch LeetCode stats.' })
  }
})

// POST /api/integrations/leetcode/:username/refresh
// Force refresh (bypass cache) and sync to DB
router.post('/:username/refresh', authMiddleware, async (req, res) => {
  try {
    const { username } = req.params
    // Invalidate cache by calling with fresh state
    const stats = await codingStatsService.getLeetCodeStats(username)

    // If this is the current user's handle, sync to DB
    const user = await prisma.user.findFirst({
      where: { leetcodeHandle: username }
    })
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          totalSolved:   stats.totalSolved,
          easySolved:    stats.easySolved,
          mediumSolved:  stats.mediumSolved,
          hardSolved:    stats.hardSolved,
          leetcodeRank:  stats.ranking,
          contestRating: stats.contestRating,
          streak:        stats.streak,
        }
      })
    }

    res.json({ ...stats, synced: !!user })
  } catch (error) {
    res.status(502).json({ message: error.message || 'Failed to refresh LeetCode stats.' })
  }
})

module.exports = router
