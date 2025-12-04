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
import CreateAssessment from "./pages/admin/CreateAssessment";

// auth
import LoginPage from "./pages/auth/LoginPage";

function App() {
  const [collapsed, setCollapsed] = React.useState(false);
  const [role, setRole] = React.useState("admin"); // teacher is admin by default

  return (
    <Router>
      <div className="app">
        <LeftNav collapsed={collapsed} setCollapsed={setCollapsed} role={role} />
        <div className="main">
          <Header role={role} setRole={setRole} />
          <div className="content">
            <Routes>
              <Route path="/" element={role === "admin" ? <AdminHome /> : <StudentHome />} />

              {/* student routes */}
              <Route path="/student/assessments" element={<StudentAssessments />} />
              <Route path="/student/leaderboard" element={<StudentLeaderboard />} />
              <Route path="/student/profile" element={<StudentProfile />} />

              {/* admin routes */}
              <Route path="/teacher/create" element={<CreateAssessment />} />
              <Route path="/teacher/analytics" element={<AdminAnalytics />} />
              <Route path="/teacher/profile" element={<AdminProfile />} />

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