import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useUser, SignedIn, SignedOut } from "@clerk/clerk-react";
import { AppContext } from "../context/AppContext.jsx";
import { Trophy, Medal, Award, RefreshCw, Home } from "lucide-react";

function Leaderboard() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { backendUrl } = useContext(AppContext);
  const [searchParams] = useSearchParams();

  // Extract paperId from URL (e.g. /leaderboard?paperId=xyz) or fall back gracefully to a global board
  const paperId = searchParams.get("paperId");

  const [boardData, setBoardData] = useState([]);
  const [userRank, setUserRank] = useState("-");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // 🌟 FIX 1: Construct a dynamic query parameter so it safely defaults to global if paperId is omitted
        const queryParam = paperId ? `?paperId=${paperId}` : "";
        const targetUrl =
          `${backendUrl}/api/quiz/leaderboard${queryParam}`.replace(
            /([^:]\/)\/+/g,
            "$1",
          );

        const response = await axios.get(targetUrl, { withCredentials: true });

        if (response.data.success) {
          setBoardData(response.data.leaderboard);

          // Identify current user dynamic standing spot
          const match = response.data.leaderboard.find(
            (item) => item.clerkId === user?.id,
          );
          if (match) setUserRank(match.rank);
        }
      } catch (err) {
        console.error("Error retrieving leaderboard data sets:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [backendUrl, paperId, user]);

  const renderRankBadge = (rankNum) => {
    switch (rankNum) {
      case 1:
        return <Trophy className="txt-warning" size={18} />;
      case 2:
        return <Medal className="txt-accent" size={18} />;
      case 3:
        return <Award className="txt-accent" size={18} />;
      default:
        return <span>{rankNum}</span>;
    }
  };

  return (
    <div className="summary-page-wrapper" style={{ marginTop: "40px" }}>
      {/* HEADER BANNER */}
      <div className="summary-hero-card" style={{ marginBottom: "24px" }}>
        <div className="hero-profile-group">
          <Trophy size={40} className="txt-accent" />
          <div>
            <h1>State Merit Leaderboard</h1>
            <p className="subtext">
              {paperId
                ? "Review competitive rankings and scores for this assessment paper."
                : "Review the overall top competitive achievements across all exam categories."}
            </p>
          </div>
        </div>
      </div>

      {/* ACCESS VALIDATION BLOCKS */}
      <div className="subject-performance-section">
        {/* 🌟 CASE A: User is SIGNED IN -> Show full rankings */}
        <SignedIn>
          {loading ? (
            <p
              style={{
                textAlign: "center",
                padding: "20px",
                color: "var(--text-muted)",
              }}
            >
              Calculating state positions from database registry streams...
            </p>
          ) : boardData.length > 0 ? (
            <>
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
                  {boardData.map((row) => (
                    <tr
                      key={row.rank}
                      className={`leaderboard-row-item ${row.clerkId === user?.id ? "current-user-row" : ""}`}
                    >
                      <td>{renderRankBadge(row.rank)}</td>
                      <td>
                        {row.candidateName}{" "}
                        {row.clerkId === user?.id && " (You)"}
                      </td>
                      <td>
                        <strong>{row.score}</strong>
                      </td>
                      <td>
                        <span
                          className="badge badge-success"
                          style={{ border: "none" }}
                        >
                          {row.accuracy}
                        </span>
                      </td>
                      <td>{row.timeTaken}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Sticky User Summary Footing Panel */}
              {userRank !== "-" && (
                <div className="sticky-user-scorecard">
                  <h4>Your Absolute Meghalaya State Standing</h4>
                  <div className="sticky-flex-metrics">
                    <span>
                      Rank: <strong>#{userRank}</strong>
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "30px",
                color: "var(--text-muted)",
              }}
            >
              <p>
                No results recorded on the server yet. Be the first to secure a
                spot!
              </p>
            </div>
          )}
        </SignedIn>

        {/* 🌟 CASE B: User is a GUEST -> Block view board access */}
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
              onClick={() => navigate("/login")}
            >
              Sign In to Unlock
            </button>
          </div>
        </SignedOut>
      </div>

      {/* CORE UTILITY ACTIONS NAV BAR FOOTER */}
      <div className="summary-actions-footer">
        <button className="btn btn-outline" onClick={() => navigate("/")}>
          <Home size={16} /> Home
        </button>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/practice")}
        >
          <RefreshCw size={16} /> Try Another Quiz
        </button>
      </div>
    </div>
  );
}

export default Leaderboard;
