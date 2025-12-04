import React from "react";
import "./CreateAssessment.css";

export default function CreateAssessment() {
  return (
    <div className="create-assessment">
      <h3>Create Assessment</h3>
      <div className="small-text">Form: title, duration, questions, visibility</div>
      <div style={{marginTop:12}}>
        <input placeholder="Assessment Title" style={{padding:8,borderRadius:8,border:'1px solid #e6e7eb',width:'100%',marginBottom:8}}/>
        <button style={{padding:10,borderRadius:8}}>Create (demo)</button>
      </div>
    </div>
  );
}
