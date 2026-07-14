import React, { useState, useEffect } from "react";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import {
  Trophy,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Download,
  RefreshCw,
  Home,
  ListOrdered,
} from "lucide-react";

import "../assets/summary.css";

function QuizSummary({
  paperId,
  quizMode,
  evaluationMetrics,
  questionsRawList,
  submittedAnswers,
}) {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userRank, setUserRank] = useState("-");

  // --- Dynamic Live Metrics Fallback Mapping ---
  const finalScore = evaluationMetrics?.score ?? 0;
  const maxPossibleMarks = evaluationMetrics?.totalMarks ?? 0;
  const correctCount = evaluationMetrics?.correct ?? 0;
  const wrongCount = evaluationMetrics?.wrong ?? 0;
  const skippedCount = evaluationMetrics?.skipped ?? 0;
  const accuracyPercentage = evaluationMetrics?.accuracy ?? "0%";
  const durationSpent = evaluationMetrics?.timeTakenString ?? "0m 0s";
  const finalRank = evaluationMetrics?.rank ?? "N/A";
  const attemptMode = quizMode === "mock" ? "Mock Test" : "Practice Mode";

  const questionsList = questionsRawList || [];
  const userAnswers = submittedAnswers || {};

  const candidateName = isLoaded && user ? user.fullName : "Guest User";
  const avatarUrl = user?.imageUrl || "https://gravatar.com";

  // --- Compute Subject/Section Wise Performance Dynamically ---
  const sectionMetrics = {};
  questionsList.forEach((q) => {
    const section = q.sectionTitle || "General Section";
    const selected = userAnswers[q._id];

    if (!sectionMetrics[section]) {
      sectionMetrics[section] = {
        name: section,
        correct: 0,
        wrong: 0,
        skipped: 0,
        total: 0,
      };
    }

    sectionMetrics[section].total += 1;
    if (selected === undefined) {
      sectionMetrics[section].skipped += 1;
    } else if (selected === q.answerKey) {
      sectionMetrics[section].correct += 1;
    } else {
      sectionMetrics[section].wrong += 1;
    }
  });

  const computedSubjectsArray = Object.values(sectionMetrics).map((sub) => {
    const attempted = sub.correct + sub.wrong;
    const accuracy = attempted
      ? Math.round((sub.correct / attempted) * 100)
      : 0;
    return {
      ...sub,
      score: sub.correct * 2, // 2 Marks per correct answer
      max: sub.total * 2,
      accuracy,
    };
  });
  // 🌟 Fetch real leaderboard metrics when user flips to the leaderboard tab
  useEffect(() => {
    if (activeTab === "leaderboard" && paperId) {
      const fetchLiveRankings = async () => {
        try {
          const backendUrl =
            window.location.hostname === "localhost"
              ? "http://localhost:3000"
              : "https://megha-quiz-87mn.vercel.app"; // 🌟 FIXED: Updated fallback domain

          const { data } = await axios.get(
            `${backendUrl}/api/quiz/leaderboard?paperId=${paperId}`,
          );

          if (data.success) {
            setLeaderboardData(data.leaderboard);

            // Look up current active user inside the array list to extract their dynamic position ranking
            const match = data.leaderboard.find(
              (item) => item.clerkId === user?.id,
            );
            if (match) setUserRank(match.rank);
          }
        } catch (err) {
          console.error("Failed to parse leaderboard metrics:", err);
        }
      };
      fetchLiveRankings();
    }
  }, [activeTab, paperId, user]);

  return (
    <div className="summary-page-wrapper">
      {/* HEADER META STRIP */}
      <div className="summary-hero-card">
        <div className="hero-profile-group">
          <img src={avatarUrl} alt="Profile" className="hero-avatar" />
          <div>
            <h1>Test Evaluation Summary</h1>
            <p className="subtext">
              Candidate: <strong>{candidateName}</strong> • {attemptMode}
            </p>
          </div>
        </div>
        <div className="hero-exam-details">
          <h3>Exam Result Sheets</h3>
          <span>Meghalaya Preparation Portal</span>
        </div>
      </div>

      {/* CORE VIEWPORT TABS CONTROL BAR */}
      <div className="summary-tab-bar">
        <button
          className={`tab-link ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          <Trophy size={18} /> Performance Dashboard
        </button>
        <button
          className={`tab-link ${activeTab === "review" ? "active" : ""}`}
          onClick={() => setActiveTab("review")}
        >
          <CheckCircle2 size={18} /> Question Review
        </button>
        <button
          className={`tab-link ${activeTab === "leaderboard" ? "active" : ""}`}
          onClick={() => setActiveTab("leaderboard")}
        >
          <ListOrdered size={18} /> Meghalaya Leaderboard
        </button>
      </div>

      {/* VIEWPORT CONTROLLER RENDERING CORES */}
      {activeTab === "dashboard" && (
        <div className="dashboard-tab-content">
          {/* OVERALL STATISTICS SCORE GRID */}
          <div className="metrics-summary-grid">
            <div className="metric-score-card highlighted">
              <h4>Score Metrics</h4>
              <h2>
                {finalScore}{" "}
                <span className="small-text">/ {maxPossibleMarks}</span>
              </h2>
              <div className="progress-ring-container">
                <span className="ring-label">
                  Accuracy: {accuracyPercentage}
                </span>
              </div>
            </div>

            <div className="metric-score-card">
              <div className="card-stat-row">
                <CheckCircle2 className="txt-success" size={20} />{" "}
                <span>Correct:</span> <strong>{correctCount}</strong>
              </div>
              <div className="card-stat-row">
                <XCircle className="txt-danger" size={20} /> <span>Wrong:</span>{" "}
                <strong>{wrongCount}</strong>
              </div>
              <div className="card-stat-row">
                <HelpCircle className="txt-warning" size={20} />{" "}
                <span>Skipped:</span> <strong>{skippedCount}</strong>
              </div>
            </div>

            <div className="metric-score-card">
              <div className="card-stat-row">
                <Clock size={20} /> <span>Time Taken:</span>{" "}
                <strong>{durationSpent}</strong>
              </div>
              <div className="card-stat-row">
                <Trophy className="txt-accent" size={20} />{" "}
                <span>Current Rank:</span> <strong>#{finalRank}</strong>
              </div>
            </div>
          </div>

          {/* SUBJECT WISE BREAKDOWN BOXES */}
          <div className="subject-performance-section">
            <h3>Subject Wise Performance</h3>
            <div className="subject-grid-layout">
              {computedSubjectsArray.length > 0 ? (
                computedSubjectsArray.map((sub, idx) => (
                  <div key={idx} className="subject-score-row">
                    <div className="sub-meta">
                      <h4>{sub.name}</h4>
                      <span>
                        Score: {sub.score} / {sub.max} ({sub.accuracy}%
                        Accuracy)
                      </span>
                    </div>
                    <div className="sub-mini-metrics">
                      <span className="badge badge-success">
                        Correct: {sub.correct}
                      </span>
                      <span className="badge badge-danger">
                        Wrong: {sub.wrong}
                      </span>
                      {sub.skipped > 0 && (
                        <span className="badge badge-warning">
                          Skipped: {sub.skipped}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: "#64748b", padding: "12px 0" }}>
                  No subject section data found for this evaluation test.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "review" && (
        <div className="review-tab-content">
          <div className="review-panel-layout">
            {questionsList.map((q, idx) => {
              const userSelectedLetter = userAnswers[q._id];
              let questionStatusClass = "skipped";
              let statusLabel = "🟡 Skipped";

              if (userSelectedLetter !== undefined) {
                if (userSelectedLetter === q.answerKey) {
                  questionStatusClass = "correct";
                  statusLabel = "🟢 Correct";
                } else {
                  questionStatusClass = "wrong";
                  statusLabel = "🔴 Wrong";
                }
              }

              return (
                <div key={q._id || idx} className="question-review-card">
                  <div className="review-card-header">
                    <span className={`status-badge ${questionStatusClass}`}>
                      {statusLabel}
                    </span>
                    <span>
                      Section: <strong>{q.sectionTitle || "General"}</strong>
                    </span>
                  </div>

                  <h3>
                    Question {idx + 1}: {q.question}
                  </h3>

                  {q.questionImage && (
                    <div
                      className="question-image-container"
                      style={{ margin: "12px 0" }}
                    >
                      <img
                        src={q.questionImage}
                        alt="Figure Reference"
                        style={{ maxHeight: "200px", borderRadius: "6px" }}
                      />
                    </div>
                  )}

                  <div className="options-review-list">
                    {q.options.map((opt, oIdx) => {
                      const optionLetter = ["A", "B", "C", "D"][oIdx];
                      const isUserSelection =
                        userSelectedLetter === optionLetter;
                      const isCorrectKey = q.answerKey === optionLetter;

                      let optClass = "";
                      if (isCorrectKey) optClass = "correct-opt";
                      else if (isUserSelection && !isCorrectKey)
                        optClass = "wrong-opt";

                      return (
                        <div
                          key={oIdx}
                          className={`review-option-item ${optClass}`}
                        >
                          <strong>{optionLetter}.</strong> {opt}
                          {isCorrectKey && " ✓"}
                          {isUserSelection && " (Your Answer)"}
                        </div>
                      );
                    })}
                  </div>

                  {q.solution && (
                    <div className="explanation-box">
                      <h4>📖 Solution & Explanation:</h4>
                      <p>{q.solution}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "leaderboard" && (
        <div className="leaderboard-tab-content">
          <h3>State Ranking Leaderboard</h3>

          {/* 🌟 CASE A: User is LOGGED IN -> Show full live ranking metrics */}
          <SignedIn>
            <table className="leaderboard-table-element">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Candidate Name</th>
                  <th>Score</th>
                  <th>Accuracy</th>
                  <th>Time Taken</th>
                </tr>
              </thead>
              <tbody>
                {/* 🌟 Loop through live, dynamic database ranking metrics */}
                {leaderboardData.length > 0 ? (
                  leaderboardData.map((row) => (
                    <tr
                      key={row.rank}
                      className={`leaderboard-row-item ${row.clerkId === user?.id ? "current-user-row" : ""}`}
                    >
                      <td>{row.rank}</td>
                      <td>
                        {row.candidateName}{" "}
                        {row.clerkId === user?.id && " (You)"}
                      </td>
                      <td>{row.score}</td>
                      <td>{row.accuracy}</td>
                      <td>{row.timeTaken}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      style={{
                        textAlign: "center",
                        padding: "24px",
                        color: "#64748b",
                      }}
                    >
                      No submission scores indexed yet for this paper. Be the
                      first to secure a spot!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Sticky Persistent User Floating Board */}
            <div className="sticky-user-scorecard">
              <h4>Your Absolute Meghalaya State Standing</h4>
              <div className="sticky-flex-metrics">
                <span>
                  {/* 🌟 Changed from finalRank to live calculated userRank state */}
                  Rank: <strong>#{userRank}</strong>
                </span>
                <span>
                  Score: <strong>{finalScore}</strong>
                </span>
                <span>
                  Accuracy: <strong>{accuracyPercentage}</strong>
                </span>
              </div>
            </div>
          </SignedIn>

          {/* 🌟 CASE B: User is a GUEST -> Block table and prompt them to authenticate */}
          <SignedOut>
            <div className="locked-leaderboard-container">
              <div className="locked-icon">🔒</div>
              <h4>Leaderboard Locked</h4>
              <p className="locked-subtext">
                Create a free account or log in to view state-wide rankings and
                compare your performance with other aspirants across Meghalaya.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => (window.location.href = "/login")}
              >
                Sign In to Unlock
              </button>
            </div>
          </SignedOut>
        </div>
      )}

      {/* FOOTER USER CONTEXT ACTIONS PANEL BAR STRIP */}
      <div className="summary-actions-footer">
        <button className="btn btn-outline" onClick={() => window.print()}>
          <Download size={16} /> PDF Result
        </button>
        <button
          className="btn btn-outline"
          onClick={() => setActiveTab("review")}
        >
          <RefreshCw size={16} /> Review Answers
        </button>
        <button
          className="btn btn-primary"
          onClick={() => (window.location.href = "/practice")}
        >
          <Home size={16} /> Go to Dashboard
        </button>
      </div>
    </div>
  );
}

export default QuizSummary;
