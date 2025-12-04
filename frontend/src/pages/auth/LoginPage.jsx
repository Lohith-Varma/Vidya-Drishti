import React from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

export default function LoginPage() {
  const nav = useNavigate();
  return (
    <div className="login-wrap">
      <div className="login-box">
        <h2>Sign in</h2>
        <button className="signin-btn" onClick={() => nav("/")}>Sign in (demo)</button>
        <div className="note small-text">Use top bar role toggle to switch Student/Admin views.</div>
      </div>
    </div>
  );
}
