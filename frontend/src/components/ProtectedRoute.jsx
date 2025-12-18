import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ allowedRole, role, children }) {
  if (role !== allowedRole) {
    return <Navigate to="/" replace />;
  }
  return children;
}
