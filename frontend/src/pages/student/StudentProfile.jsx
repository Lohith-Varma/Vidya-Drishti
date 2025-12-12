// import React from "react";
// import "./StudentProfile.css";

// // 👇 add these imports (adjust the path if your structure is different)
// import LeetCodeStatsCard from "../../components/LeetCodeStatsCard";
// import HackerRankBadges from "../../components/HackerRankBadges";

// export default function StudentProfile() {
//   const leetcodeUsername = "some_username"; // later pull from DB / student profile
//   const hackerrankUsername = "hr_username";

//   return (
//     <div className="student-profile">
//       <h3>Profile</h3>
//       <div className="small-text">
//         Edit profile, link handles (LeetCode/CF/GitHub), upload resume
//       </div>

//       {/* you don't need LeetCodeStatsCard twice, so let's keep one section */}
//       <div className="profile-stats-grid">
//         <LeetCodeStatsCard username={leetcodeUsername} />
//         <HackerRankBadges username={hackerrankUsername} />
//       </div>
//     </div>
//   );
// }


import React from "react";
import "./StudentProfile.css";

import LeetCodeStatsCard from "../../components/LeetCodeStatsCard";
import HackerRankBadges from "../../components/HackerRankStatsCard";

export default function StudentProfile() {
  const leetcodeUsername = "some_username";   // later from DB
  const hackerrankUsername = "hr_username";

  return (
    <div className="student-profile">
      <h3>Profile</h3>
      <div className="small-text">
        Edit profile, link handles (LeetCode/CF/GitHub), upload resume
      </div>

      <div className="profile-stats-grid">
        <LeetCodeStatsCard username={leetcodeUsername} />
        <HackerRankBadges username={hackerrankUsername} />
      </div>
    </div>
  );
}
