import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LeftNav from "./components/LeftNav";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
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
import CodingProfiles from "./pages/admin/CodingProfiles";

// auth
import LoginPage from "./pages/auth/LoginPage";

function App() {
  const [role, setRole] = React.useState(() => {
    return localStorage.getItem("role") || "student";
  });


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
                element={role === "admin" ? <AdminHome /> : <StudentHome />}
              />

              {/* student routes */}
              <Route
                path="/student/assessments"
                element={
                  <ProtectedRoute role={role} allowedRole="student">
                    <StudentAssessments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/leaderboard"
                element={
                  <ProtectedRoute role={role} allowedRole="student">
                    <StudentLeaderboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/profile"
                element={
                  <ProtectedRoute role={role} allowedRole="student">
                    <StudentProfile />
                  </ProtectedRoute>
                }
              />

              {/* admin routes */}
              <Route
                path="/admin/home"
                element={
                  <ProtectedRoute role={role} allowedRole="admin">
                    <AdminHome />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/create"
                element={
                  <ProtectedRoute role={role} allowedRole="admin">
                    <CreateAssessment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute role={role} allowedRole="admin">
                    <AdminAnalytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/profile"
                element={
                  <ProtectedRoute role={role} allowedRole="admin">
                    <AdminProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/leaderboard"
                element={
                  <ProtectedRoute role={role} allowedRole="admin">
                    <AdminLeaderboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/coding-profiles"
                element={
                  <ProtectedRoute role={role} allowedRole="admin">
                    <CodingProfiles />
                  </ProtectedRoute>
                }
              />

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
