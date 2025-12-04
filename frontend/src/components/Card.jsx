import React from "react";
import "./Card.css";

export default function Card({ title, children }) {
  return (
    <div className="card">
      <div className="card-title">{title}</div>
      <div className="card-body">{children}</div>
    </div>
  );
}
