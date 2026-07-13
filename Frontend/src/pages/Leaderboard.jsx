import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext.jsx";
import { Trophy, Medal, Award, RefreshCw, Home } from "lucide-react";

function Leaderboard() {
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);
  const [boardData, setBoardData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const targetUrl = `${backendUrl}/api/quiz/leaderboard/global`.replace(/([^:]\/)\/+/g, "$1");
        const response = await axios.get(targetUrl, { withCredentials: true });
        if (response.data.success) {
          setBoardData(response.data.data);
        }
      } catch (err) {
        console.error("Error retrieving leaderboard data sets:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [backendUrl]);

  const renderRankBadge = (index) => {
    switch (index) {
      case 0: return <Trophy className="rank-badge gold" size={20} />;
      case 1: return <Medal className="rank-badge silver" size={20} />;
      case 2: return <Award className="rank-badge bronze" size={20} />;
      default: return <span className="rank-number-text">{index + 1}</span>;
    }
  };

  return (
    <div className="leaderboard-page-layout">
      <div className="leaderboard-header-banner">
        <Trophy size={40} className="floating-trophy" />
        <h1>Meghalaya State Merit Board</h1>
        <p>Review the top competitive scoring achievements for active MPSC screening categories.</p>
      </div>

      <div className="leaderboard-container-card">
        {loading ? (
          <p className="board-loading">Calculating ranks from database cluster streams...</p>
        ) : boardData.length > 0 ? (
          <div className="board-table-responsive-wrapper">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Candidate Name</th>
                  <th>Assessment Topic</th>
                  <th>Correct Score</th>
                  <th>Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {boardData.map((row, index) => (
                  <tr key={row._id} className={`board-tr-row rank-${index}`}>
                    <td>{renderRankBadge(index)}</td>
                    <td className="candidate-name-cell">{row.userName}</td>
                    <td className="topic-title-cell">{row.topicTitle}</td>
                    <td className="score-cell"><strong>{row.score}</strong> / {row.totalQuestions}</td>
                    <td><span className="accuracy-pill-badge">{row.accuracy}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-board-prompt">
            <Award size={36} />
            <p>No results recorded on the server yet. Be the first to secure a rank spot today!</p>
          </div>
        )}

        <div className="leaderboard-actions-row">
          <button className="btn-board-nav btn-home" onClick={() => navigate("/")}>
            <Home size={16} /> Home
          </button>
          <button className="btn-board-nav btn-retry" onClick={() => navigate("/practice")}>
            <RefreshCw size={16} /> Try Another Quiz
          </button>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
