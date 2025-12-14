import React, { useState } from "react";
import "./CodingProfiles.css";

const mockStudents = [
  {
    name: "Gnana Deep",
    roll: "21CSE102",
    profiles: {
      LeetCode: "gnanadeep",
      Codeforces: "gnana_cf",
      CodeChef: "gnanacc",
      HackerRank: "gnana_hr",
      GitHub: "gnanadeep",
      LinkedIn: "gnana-deep",
    },
  },
  {
    name: "Siddhartha",
    roll: "21CSE087",
    profiles: {
      LeetCode: "sid_codes",
      Codeforces: "sid_cf",
      CodeChef: "sid_cc",
      HackerRank: "sid_hr",
      GitHub: "siddhartha-dev",
      LinkedIn: "siddhartha",
    },
  },
];

export default function CodingProfiles() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleStudent = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="codingProfiles">
      <div className="codingHeader">
        <h1>Coding Profiles</h1>
        <p>Click on a student to view their coding profiles</p>
      </div>

      <div className="studentList">
        {mockStudents.map((student, index) => (
          <div key={index} className="studentItem">
            {/* STUDENT HEADER */}
            <div
              className="studentRow"
              onClick={() => toggleStudent(index)}
            >
              <div>
                <h3>{student.name}</h3>
                <span className="roll">{student.roll}</span>
              </div>
              <span className="toggle">
                {openIndex === index ? "−" : "+"}
              </span>
            </div>

            {/* EXPANDED CONTENT */}
            {openIndex === index && (
              <div className="profilesBox">
                {Object.entries(student.profiles).map(
                  ([platform, username]) => (
                    <ProfileRow
                      key={platform}
                      platform={platform}
                      username={username}
                    />
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileRow({ platform, username }) {
  const links = {
    LeetCode: `https://leetcode.com/${username}`,
    Codeforces: `https://codeforces.com/profile/${username}`,
    CodeChef: `https://www.codechef.com/users/${username}`,
    HackerRank: `https://www.hackerrank.com/${username}`,
    GitHub: `https://github.com/${username}`,
    LinkedIn: `https://linkedin.com/in/${username}`,
  };

  return (
    <div className="profileRow">
      <span className={`badge ${platform.toLowerCase()}`}>
        {platform}
      </span>
      <span className="username">{username}</span>
      <a
        href={links[platform]}
        target="_blank"
        rel="noreferrer"
        className="viewLink"
      >
        View →
      </a>
    </div>
  );
}
