import React, { useEffect, useState, useContext } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { AppContext } from "../context/AppContext.jsx";
import {
  Trophy,
  Clock,
  CheckCircle2,
  Award,
  Calendar,
  BookOpen,
  User,
  Zap,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import "../assets/studentDashboard.css";

export default function StudentDashboard() {
  const { backendUrl } = useContext(AppContext);
const { getToken, isLoaded, isSignedIn } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  if (!isLoaded || !isSignedIn) return;
  const fetchDashboardStats = async () => {
    try {
      // Step 1: Get the Clerk authentication token
      const token = await getToken();

      // Step 2: Send the token to the backend
      const res = await axios.get(
        `${backendUrl}/api/quiz/student-stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Step 3: Store the dashboard data
      if (res.data.success) {
        setData(res.data);
      } else {
        setError(
          res.data.message || "Failed to load performance metrics.",
        );
      }
    } catch (err) {
      console.error(
        "Dashboard profile analytical query failure:",
        err,
      );

      setError("Could not establish communication with server nodes.");
    } finally {
      setLoading(false);
    }
  };

  fetchDashboardStats();
}, [backendUrl, getToken]);

  if (loading) {
    return (
      <div className="db-loader-container">
        <div className="db-spinner"></div>
        <p>Assembling your performance metrics map...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="db-error-wrapper">
        <AlertCircle size={40} className="txt-danger" />
        <h3>Profile Retrieval Delayed</h3>
        <p>
          {error ||
            "Please authenticate using your candidate profile key to unlock metrics."}
        </p>
      </div>
    );
  }

  const { profile, attempts } = data;
  const totalAttemptsCount = attempts?.length || 0;

  // --- Dynamic Aggregate Analytical Compilations ---
  const averageAccuracy = totalAttemptsCount
    ? Math.round(
        attempts.reduce((acc, curr) => acc + (curr.accuracy || 0), 0) /
          totalAttemptsCount,
      )
    : 0;

  const totalPointsScored = totalAttemptsCount
    ? attempts.reduce((acc, curr) => acc + (curr.score || 0), 0)
    : 0;

  const highestScoreRecord = totalAttemptsCount
    ? Math.max(...attempts.map((item) => item.score || 0))
    : 0;

  return (
    <div className="student-dashboard-container">
      <header className="db-hero-profile-card">
        <div className="db-profile-meta-group">
          {/* 🌟 FIX: Updated style configuration to frame and handle the circular avatar image cleanly */}
          <div
            className="db-avatar-placeholder"
            style={{
              padding: 0,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {profile?.profileImage ? (
              <img
                src={profile.profileImage}
                alt="Candidate Profile Workspace"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                referrerPolicy="no-referrer" // Prevents Google from blocking image requests across cross-origins
              />
            ) : (
              <User size={32} /> // Native Lucide vector icon fallback if image is missing
            )}
          </div>
          <div>
            <h2>{profile?.fullName || "Aspirant"}</h2>
            <p className="db-subtext">
              Account Email: <strong>{profile?.email}</strong> • Role Status:{" "}
              <span className="db-role-badge">{profile?.role || "user"}</span>
            </p>
          </div>
        </div>

        <div className="db-hero-agg-score-box">
          <Award size={26} className="txt-accent" />
          <div>
            <span>Global Accuracy</span>
            <h3>{averageAccuracy}%</h3>
          </div>
        </div>
      </header>

      {/* 📈 PERFORMANCE AGGREGATE SUMMARY PLOTS GRID */}
      <section className="db-insights-counters-grid">
        <div className="insight-stat-box">
          <div className="insight-icon-row icon-blue">
            <BookOpen size={22} />
          </div>
          <div className="insight-content-block">
            <h3>{totalAttemptsCount}</h3>
            <p>Exams Attempted</p>
          </div>
        </div>

        <div className="insight-stat-box">
          <div className="insight-icon-row icon-gold">
            <Trophy size={22} />
          </div>
          <div className="insight-content-block">
            <h3>{totalPointsScored}</h3>
            <p>Cumulative Marks Scored</p>
          </div>
        </div>

        <div className="insight-stat-box">
          <div className="insight-icon-row icon-emerald">
            <Zap size={22} />
          </div>
          <div className="insight-content-block">
            <h3>{highestScoreRecord}</h3>
            <p>Personal Best Score</p>
          </div>
        </div>

        <div className="insight-stat-box">
          <div className="insight-icon-row icon-purple">
            <TrendingUp size={22} />
          </div>
          <div className="insight-content-block">
            <h3>
              {averageAccuracy >= 70
                ? "Excellent"
                : averageAccuracy >= 45
                  ? "Steady"
                  : "Needs Review"}
            </h3>
            <p>Preparation Velocity</p>
          </div>
        </div>
      </section>

      {/* 📝 RETROSPECTIVE ACTIVITY LOGS SHEET */}
      <section className="db-history-logs-section">
        <div className="db-section-header">
          <h3>📝 Retrospective Exam Execution Records</h3>
          <span className="db-count-tag">{totalAttemptsCount} Log Entries</span>
        </div>

        <div className="db-logs-timeline-list">
          {totalAttemptsCount === 0 ? (
            <div className="db-no-data-placeholder">
              <p>
                No historical evaluation sessions tracked yet on your profile.
              </p>
              <p className="hint">
                Launch items inside the Practice layout or read Current Affairs
                capsules to start capturing live metrics!
              </p>
            </div>
          ) : (
            attempts.map((log) => {
              const isCAQuiz = log.quizType === "currentAffairs";
              const formattedDate = new Date(log.createdAt).toLocaleDateString(
                "en-IN",
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                },
              );

              return (
                <div
                  className={`db-history-log-row ${isCAQuiz ? "ca-row-accent" : ""}`}
                  key={log._id}
                >
                  <div className="db-log-left-meta">
                    <div className="db-log-title-wrapper">
                      <h4>
                        {isCAQuiz
                          ? `📰 Current Affairs: ${log.currentAffairsId?.weekTitle || "Weekly Revision Quiz"}`
                          : `🏛️ Exam: ${log.paperId?.paperTitle || "Historical Recruitment Paper"}`}
                      </h4>
                      <span className="db-log-timestamp">
                        <Calendar size={13} /> {formattedDate} • Mode:{" "}
                        <em className="db-mode-text">{log.mode}</em>
                      </span>
                    </div>
                  </div>

                  <div className="db-log-right-metrics">
                    <div className="db-metric-badge-pill acc-pill">
                      <span>Accuracy</span>
                      <strong>{log.accuracy}%</strong>
                    </div>
                    <div className="db-metric-badge-pill score-pill">
                      <span>Marks</span>
                      <strong>
                        {log.score}{" "}
                        <small className="txt-muted">
                          / {log.totalQuestions * 2}
                        </small>
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
