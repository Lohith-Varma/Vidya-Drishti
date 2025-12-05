// backend/server.js
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ROUTES (we’ll add them below)
const leetcodeRoutes = require("./routes/leetcode");
const hackerrankRoutes = require("./routes/hackerrank");

app.use("/api/leetcode", leetcodeRoutes);
app.use("/api/hackerrank", hackerrankRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
