import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LeftNav from "./components/LeftNav";
import Header from "./components/Header";
import "./App.css";

// student pages
import StudentHome from "./pages/student/StudentHome";
import StudentAssessments from "./pages/student/StudentAssessments";
import StudentLeaderboard from "./pages/student/StudentLeaderboard";
import StudentProfile from "./pages/student/StudentProfile";

// admin pages
import AdminHome from "./pages/admin/AdminHome";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminLeaderboard from "./pages/admin/AdminLeaderboard";
import CreateAssessment from "./pages/admin/CreateAssessment";

// auth
import LoginPage from "./pages/auth/LoginPage";

function App() {
  const [role, setRole] = React.useState("admin");

  return (
    <Router>
      <div className="app">
        <LeftNav role={role} /> {/* removed collapsed props */}

        <div className="main">
          <Header role={role} setRole={setRole} />

          <div className="content">
            <Routes>
              {/* role-based home */}
              <Route
                path="/"
                element={
                  role === "admin" ? <AdminHome /> : <StudentHome />
                }
              />

              {/* student routes */}
              <Route path="/student/assessments" element={<StudentAssessments />} />
              <Route path="/student/leaderboard" element={<StudentLeaderboard />} />
              <Route path="/student/profile" element={<StudentProfile />} />

              {/* admin routes */}
              <Route path="/admin/create" element={<CreateAssessment />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/profile" element={<AdminProfile />} />
              <Route path="/admin/leaderboard" element={<AdminLeaderboard />} />

              {/* auth */}
              <Route path="/login" element={<LoginPage />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
