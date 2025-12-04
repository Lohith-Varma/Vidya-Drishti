import React from "react";
import "./AdminAnalytics.css";
import Card from "../../components/Card";

export default function AdminAnalytics() {
  return (
    <div className="admin-analytics">
      <h3>Analytics</h3>
      <div className="cards-grid">
        <Card title="Cohort Performance">Average, median and trends</Card>
        <Card title="Weak-topic Breakdown">DP: 18% | Graphs: 22%</Card>
      </div>
    </div>
  );
}
