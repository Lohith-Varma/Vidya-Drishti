import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Header from "./components/Header";
import LeftNav from "./components/LeftNav";

import AdminHome from "./pages/admin/AdminHome";
import CodingProfiles from "./pages/admin/CodingProfiles";

import StudentHome from "./pages/student/StudentHome";

import "./App.css";

export default function App() {
  const [role, setRole] = useState("admin"); // default role

  return (
    <Router>
      <div className="app">
        <Header role={role} setRole={setRole} />
        <LeftNav role={role} />

        <div className="main">
          <div className="content">
            <Routes>
              {/* ADMIN ROUTES */}
              {role === "admin" && (
                <>
                  <Route path="/admin/home" element={<AdminHome />} />
                  <Route path="/admin/coding-profiles" element={<CodingProfiles />} />
                  <Route path="*" element={<Navigate to="/admin/home" />} />
                </>
              )}

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
