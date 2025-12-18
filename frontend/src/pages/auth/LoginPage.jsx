import React from "react";
import "./LoginPage.css";

export default function LoginPage() {
  return (
    <div className="loginWrapper">

      {/* Gradient Banner */}
      <div className="loginBanner">
        <h1 className="bannerTitle">Vidya-Drishti Portal</h1>
        <p className="bannerSubtitle">Your academic dashboard, simplified.</p>
      </div>

      {/* Center Card */}
      <div className="loginCard">
        <h2 className="loginTitle">Sign In</h2>
        <p className="loginSubtitle">Welcome back! Please enter your credentials.</p>

        <form className="loginForm">
          <label>Email</label>
          <input type="email" placeholder="prof@example.com" required />

          <label>Password</label>
          <input type="password" placeholder="••••••••" required />

          <button type="submit" className="loginBtn">
            Continue
          </button>
        </form>

        <p className="footerText">
          Need help? <span className="linkText">Contact support</span>
        </p>
      </div>
    </div>
  );
}
