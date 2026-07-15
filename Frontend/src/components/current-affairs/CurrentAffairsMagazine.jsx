import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./magazine.css";

export default function CurrentAffairsMagazine() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`/api/current-affairs/${id}`)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error formatting magazine structure:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return <div className="magazine-loader">Printing Weekly Edition...</div>;
  if (!data || !data.issue)
    return (
      <div className="magazine-error">
        Requested publication could not be recovered.
      </div>
    );

  const { issue, articles } = data;

  return (
    <div className="magazine-viewport">
      {/* Newspaper Masthead */}
      <header className="magazine-masthead">
        <div className="publication-brand">Megha Quiz Weekly Chronicle</div>
        <h1>WEEKLY JOURNAL</h1>
        <div className="issue-meta-line">
          <span>
            <strong>EDITION:</strong> {issue.weekTitle}
          </span>
          <span className="divider">|</span>
          <span>
            <strong>STATUS:</strong> Verified Official
          </span>
        </div>
      </header>

      {/* Editorial Content Column */}
      <main className="newspaper-layout-grid">
        {articles.length === 0 ? (
          <p className="no-content">
            Articles are currently being drafted for this volume.
          </p>
        ) : (
          articles.map((article) => (
            <article className="news-editorial-block" key={article._id}>
              <h2 className="article-headline">{article.title}</h2>
              <div className="article-summary-bar">
                <em>{article.summary}</em>
              </div>

              {/* Optional Images / Visual Layout Anchors */}
              {(article.image || article.graph) && (
                <div className="editorial-media-container">
                  {article.image && (
                    <img
                      src={article.image}
                      alt="Visual report snapshot"
                      className="news-img"
                    />
                  )}
                  {article.graph && (
                    <div className="graph-placeholder-box">
                      📈 Data Matrix Active: {article.graph}
                    </div>
                  )}
                </div>
              )}

              <p className="article-main-body">{article.content}</p>

              {/* Exam Notes and Takeaway Cards */}
              <div className="editorial-takeaway-footer">
                <div className="takeaway-badge">🎯 EXAM TAKEAWAY</div>
                <p className="takeaway-text">{article.examPoint}</p>
              </div>
            </article>
          ))
        )}
      </main>

      {/* Dynamic Quiz Revision Launcher Trigger */}
      <footer className="magazine-footer-action-panel">
        <div className="action-callout-card">
          <h3>Comprehension Review Complete?</h3>
          <p>
            Launch the weekly practice quiz to test your memory of these topics
            in the test engine.
          </p>
          <button
            className="launch-revision-quiz-btn"
            onClick={() => navigate(`/quiz?currentAffairsId=${issue._id}`)}
          >
            ✏️ Start Weekly Revision Quiz
          </button>
        </div>
      </footer>
    </div>
  );
}
