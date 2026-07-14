import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext.jsx";
import {
  BookOpen,
  GraduationCap,
  ChevronRight,
  LayoutGrid,
} from "lucide-react";

function Practice() {
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);

  // --- Core UI State Management ---
  const [recruitments, setRecruitments] = useState([]);
  const [selectedRecruitment, setSelectedRecruitment] = useState(null);
  const [papers, setPapers] = useState([]);

  const [activeCategory, setActiveCategory] = useState("mpsc");
  const [loading, setLoading] = useState(true);
  const [expandedRecruitment, setExpandedRecruitment] = useState(null);

  // --- 1. Fetch Recruitments on Tab Switch ---
  useEffect(() => {
    const fetchRecruitments = async () => {
      setLoading(true);
      try {
        const targetUrl =
          `${backendUrl}/api/recruitment?authorityId=${activeCategory.toLowerCase()}`.replace(
            /([^:]\/)\/+/g,
            "$1",
          );

        const response = await axios.get(targetUrl, {
          withCredentials: true,
        });

        if (response.data.success) {
          setRecruitments(response.data.recruitment || []);
        }
      } catch (error) {
        console.error("Error loading recruitments:", error);
        toast.error("Failed to load recruitment categories.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecruitments();
  }, [backendUrl, activeCategory]);

  // --- 2. Fetch linked Papers when a Recruitment card is selected ---
  const handleRecruitmentSelect = async (recruitmentItem) => {
    setSelectedRecruitment(recruitmentItem);
    setPapers([]);
    setLoading(true);
    try {
      const targetUrl =
        `${backendUrl}/api/paper?recruitmentId=${recruitmentItem._id}`.replace(
          /([^:]\/)\/+/g,
          "$1",
        );

      const response = await axios.get(targetUrl, {
        withCredentials: true,
      });

      if (response.data.success) {
        setPapers(response.data.papers || []);
      }
    } catch (error) {
      console.error("Error loading papers:", error);
      toast.error("Could not retrieve question papers.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fullstack-practice-dashboard">
      <div className="practice-hero-banner">
        <h1>Dynamic Practice Portal</h1>
        <p>
          Select your targeted state exam category, choose an exam, and pick a
          topic to launch your session.
        </p>
      </div>

      <div className="practice-container">
        {/* STEP 1: CATEGORY TABS SELECTOR */}
        <div className="category-tabs-row">
          {[
            { display: "MPSC", slug: "mpsc" },
            { display: "DSC", slug: "dsc-eastern-west-khasi-hills" },
            { display: "MERB", slug: "merb" },
            { display: "SMB", slug: "smb" },
            { display: "JMB", slug: "jmb" },
            { display: "MIDC", slug: "midc" },
            { display: "High Court", slug: "high-court" },
            { display: "GAD", slug: "gad" },
          ].map((cat) => (
            <button
              key={cat.slug}
              className={`cat-tab ${activeCategory === cat.slug ? "active" : ""}`}
              onClick={() => {
                setActiveCategory(cat.slug);
                setSelectedRecruitment(null);
                setPapers([]);
              }}
            >
              {cat.display}
            </button>
          ))}
        </div>

        <div className="dashboard-split-grid">
          {/* STEP 2: AVAILABLE RECRUITMENTS */}
          <div className="exams-column">
            <h2>
              <GraduationCap size={20} /> Available Recruitment (
              {activeCategory.split("-")[0].toUpperCase()})
            </h2>
            <div className="exams-list-container">
              {recruitments.length > 0 ? (
                recruitments.map((job) => (
                  <>
                    <div
                    key={job._id}
                    className={`exam-selection-card ${
                      selectedRecruitment?._id === job._id ? "selected" : ""}`}
                    onClick={() => {handleRecruitmentSelect(job);
                      if (window.innerWidth <= 768) {
                        setExpandedRecruitment(
                          expandedRecruitment === job._id ? null : job._id
                        );
                      }
                      }}
                  >
                    <div>
                      <h3>{job.postName}</h3>
                      <p>{job.department || "No department specified"}</p>

                      {job.advertisementYear && (
                        <span className="text-xs opacity-60">
                          Year: {job.advertisementYear}
                        </span>
                      )}
                    </div>
                    <ChevronRight size={18} className="arrow-icon" />
                  </div>

                  {/* Mobile dropdown goes here */}
                  {expandedRecruitment === job._id && (
  <div className="mobile-paper-dropdown">
    {loading ? (
      <p>Loading papers...</p>
    ) : papers.length > 0 ? (
      papers.map((paper) => {
        const displayYear = paper.examDate
          ? new Date(paper.examDate).getFullYear()
          : "N/A";

        return (
          <div key={paper._id} className="mobile-paper-card">
            <h4>{paper.paperTitle}</h4>

            <p>
              {paper.totalQuestions} Questions • {displayYear}
            </p>

            <div className="action-buttons-row">
              <button
                className="btn-action practice-mode-btn"
                onClick={() =>
                  navigate(`/quiz?mode=practice&paperId=${paper._id}`)
                }
              >
                Practice
              </button>

              <button
                className="btn-action mock-mode-btn"
                onClick={() =>
                  navigate(`/quiz?mode=mock&paperId=${paper._id}`)
                }
              >
                Mock
              </button>

              {paper.pdf && (
                <a
                  href={paper.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-action pdf-download-btn"
                >
                  PDF
                </a>
              )}
            </div>
          </div>
        );
      })
    ) : (
      <p>No papers available.</p>
    )}
  </div>
)}
</>
                ))
              ) : (
                <p className="empty-prompt">
                  No active Recruitment configured for this Authority yet.
                </p>
              )}
            </div>
          </div>

          {/* STEP 3: EXAM PAPERS (SYNCED WITH NEW MODEL FIELDS) */}
          <div className="topics-column">
            <h2>
              <BookOpen size={20} /> Exam Papers & Subjects
            </h2>

            {!selectedRecruitment ? (
              <div className="placeholder-info-box">
                <LayoutGrid size={32} />
                <p>
                  Please select an exam from the left panel to display available
                  quiz modules.
                </p>
              </div>
            ) : loading ? (
              <p className="loading-text">
                Fetching papers from Atlas database...
              </p>
            ) : (
              <div className="topics-grid-layout">
                {papers.length > 0 ? (
                  papers.map((paper) => {
                    // Safety check to safely parse the year directly out of the Date field
                    const displayYear = paper.examDate
                      ? new Date(paper.examDate).getFullYear()
                      : "N/A";

                    return (
                      <div key={paper._id} className="topic-launch-card">
                        {/* ✅ Changed from paper.title to paper.paperTitle */}
                        <h3>{paper.paperTitle}</h3>
                        <p>
                          Questions:{" "}
                          <strong>{paper.totalQuestions || 0}</strong> MCQs |
                          Year: <strong>{displayYear}</strong>
                        </p>

                        <div className="action-buttons-row">
                          {/* BUTTON 1: PRACTICE MODE */}
                          <button
                            className="btn-action practice-mode-btn"
                            onClick={() => {
                              localStorage.removeItem(
                                `userAnswers_${paper._id}`,
                              );
                              localStorage.removeItem(`bookmarks_${paper._id}`);
                              navigate(
                                `/quiz?mode=practice&paperId=${paper._id}`,
                              );
                            }}
                          >
                            Practice Mode
                          </button>

                          {/* BUTTON 2: MOCK TEST */}
                          <button
                            className="btn-action mock-mode-btn"
                            onClick={() => {
                              localStorage.removeItem(
                                `userAnswers_${paper._id}`,
                              );
                              localStorage.removeItem(`bookmarks_${paper._id}`);
                              navigate(`/quiz?mode=mock&paperId=${paper._id}`);
                            }}
                          >
                            Mock Test
                          </button>

                          {/* 📄 VIEW OFFICIAL PDF BOOKLET BUTTON */}
                          {/* Evaluates if a link string exists and maps it directly to the anchor href */}
                          {paper.pdf && (
                            <a
                              href={paper.pdf} // Loads the direct MPSC server link straight out of your database document
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-action pdf-download-btn"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "10px 14px",
                                backgroundColor: "#f3f4f6",
                                color: "#374151",
                                border: "1px solid #d1d5db",
                                borderRadius: "8px",
                                fontSize: "13px",
                                fontWeight: "500",
                                textDecoration: "none",
                                cursor: "pointer",
                                transition: "all 0.15s",
                              }}
                            >
                              📄 View PDF
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="empty-prompt">
                    No question papers uploaded for this recruitment model yet.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Practice;
