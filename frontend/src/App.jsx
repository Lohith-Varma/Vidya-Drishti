import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Header from "./components/Header";
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
import CodingProfiles from "./pages/admin/CodingProfiles";

import StudentHome from "./pages/student/StudentHome";

import "./App.css";

function App() {
  const [role, setRole] = React.useState(() => {
    return localStorage.getItem("role") || "student";
  });


  return (
    <Router>
      <div className="app">
        <Header role={role} setRole={setRole} />
        <LeftNav role={role} />

        <div className="main">
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

              {/* STUDENT ROUTES */}
              {role === "student" && (
                <>
                  <Route path="/student/home" element={<StudentHome />} />
                  <Route path="*" element={<Navigate to="/student/home" />} />
                </>
              )}
            </Routes>

          </div>
        </div>
      </div>
    </Router>
  );
}
