import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./magazine.css";

export default function CurrentAffairsTimeline() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("/api/current-affairs")
      .then((res) => {
        // 🌟 Ensure we only set state if data is a valid array
        if (Array.isArray(res.data)) {
          setIssues(res.data);
        } else {
          console.error("Expected array from server, received:", res.data);
          setIssues([]); // Fallback to an empty list
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Timeline loading failed:", err);
        setIssues([]); // Fallback to an empty list on network failure
        setLoading(false);
      });
  }, []);

  if (loading)
    return <div className="magazine-loader">Opening Archives...</div>;

  return (
    <div className="timeline-container">
      <header className="timeline-header">
        <h1>Current Affairs Feed</h1>
        <p>
          Select a weekly publication to review structural local briefings and
          sit for evaluation.
        </p>
      </header>

      <div className="timeline-list">
        {/* 🌟 Protected check with Array.isArray to stop e.map production runtime breakages completely */}
        {!Array.isArray(issues) || issues.length === 0 ? (
          <div className="no-issues">
            No weekly issues published yet or server response is invalid. Use the database seeder to inject records.
          </div>
        ) : (
          issues.map((issue) => (
            <div
              key={issue._id}
              className="timeline-item-card"
              onClick={() => navigate(`/current-affairs/issue/${issue._id}`)}
            >
              <div className="card-left">
                <span className="calendar-badge">📆 Issue</span>
                <h3>{issue.weekTitle}</h3>
                <p>{issue.description}</p>
              </div>
              <div className="card-right">
                <span className="read-arrow">Read Edition →</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
