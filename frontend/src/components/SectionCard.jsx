import React from "react";
import "./SectionCard.css";

export default function SectionCard({ title, children }) {
  return (
    <div className="sectionCard">
      <h3>{title}</h3>
      {children}
    </div>
  );
}
