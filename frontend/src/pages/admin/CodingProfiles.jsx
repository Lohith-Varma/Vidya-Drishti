import React, { useState } from "react";
import { FiChevronDown, FiChevronRight, FiExternalLink } from "react-icons/fi";
import "./CodingProfiles.css";

const students = [
  {
    name: "Lohith Varma",
    roll: "23NU1A0517",
    profiles: {
      LeetCode: "https://leetcode.com/u/dklohithvarma",
      Codeforces: "https://codeforces.com/profile/lohith",
      CodeChef: "https://www.codechef.com/users/lohithvarma",
      HackerRank: "https://www.hackerrank.com/lohith_varma",
      GitHub: "https://github.com/Lohith-Varma/",
      LinkedIn: "https://www.linkedin.com/in/LohtihVarma/",
    },
  },
  {
    name: "Siddhartha",
    roll: "21CSE087",
    profiles: {
      LeetCode: "https://leetcode.com/u/msvssiddhartha",
      Codeforces: "https://codeforces.com/profile/sid_cf",
      CodeChef: "https://www.codechef.com/users/sid_cc",
      HackerRank: "https://www.hackerrank.com/sid_hr",
      GitHub: "https://github.com/siddu0426",
      LinkedIn: "https://www.linkedin.com/in/siddhartha-mylavarapu/",
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
      <h1>Coding Profiles</h1>
      <p className="subtitle">
        View student competitive programming and professional profiles
      </p>

      <div className="studentList">
        {students.map((student, index) => {
          const isOpen = openIndex === index;

          return (
            <div key={student.roll} className="studentBlock">
              {/* STUDENT HEADER */}
              <button
                className="studentHeader"
                onClick={() => toggleStudent(index)}
              >
                <div>
                  <h3>{student.name}</h3>
                  <span>{student.roll}</span>
                </div>

                {isOpen ? <FiChevronDown /> : <FiChevronRight />}
              </button>

              {/* PROFILES */}
              {isOpen && (
                <div className="profiles">
                  {Object.entries(student.profiles).map(
                    ([platform, link]) => (
                      <button
                        key={platform}
                        className={`profileRow ${platform.toLowerCase()}`}
                        onClick={() => window.open(link, "_blank")}
                      >
                        <span>{platform}</span>
                        <FiExternalLink />
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
