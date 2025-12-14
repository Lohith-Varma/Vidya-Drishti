import React from "react";
import "./StatCard.css";

export default function StatCard({ title, value }) {
  return (
    <div className="statCard">
      <h4>{title}</h4>
      <p className="statValue">{value}</p>
    </div>
  );
}
