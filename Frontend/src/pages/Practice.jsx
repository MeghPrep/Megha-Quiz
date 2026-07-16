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
  Loader2,
} from "lucide-react";

function Practice() {
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);

  // --- Core UI State Management ---
  const [recruitments, setRecruitments] = useState([]);
  const [selectedRecruitment, setSelectedRecruitment] = useState(null);
  const [papers, setPapers] = useState([]);

  const [activeCategory, setActiveCategory] = useState("mpsc");
  const [recruitmentLoading, setRecruitmentLoading] = useState(true);
  const [papersLoading, setPapersLoading] = useState(false);

  const [expandedRecruitment, setExpandedRecruitment] = useState(null);

  // --- 1. Fetch Recruitments on Tab Switch ---
  useEffect(() => {
    const fetchRecruitments = async () => {
      setRecruitmentLoading(true);
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
        setRecruitmentLoading(false);
      }
    };

    fetchRecruitments();
  }, [backendUrl, activeCategory]);

  // --- 2. Fetch linked Papers when a Recruitment card is selected ---
  const handleRecruitmentSelect = async (recruitmentItem) => {
    setSelectedRecruitment(recruitmentItem);
    setPapers([]);
    setPapersLoading(true);
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
      setPapersLoading(false);
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

<div className="exams-column full-width-accordian">
  <h2>
    <GraduationCap size={20} /> Available Recruitment ({activeCategory.split("-")[0].toUpperCase()})
  </h2>
  <div className="exams-list-container">
    {recruitmentLoading ? (
      <div className="flex-spinner-centered">
        <Loader2 className="spinner-icon large" size={36} />
        <p className="loading-text">Loading recruitments...</p>
      </div>
    ) : recruitments.length > 0 ? (
      recruitments.map((job) => {
        const isExpanded = expandedRecruitment === job._id;

        return (
          <div key={job._id} className={`recruitment-interactive-container ${isExpanded ? "active" : ""}`}>
            {/* THE CLICKABLE HEAD CARD TRIGGER ROW */}
            <div
              className={`exam-selection-card ${isExpanded ? "selected" : ""}`}
              onClick={() => {
                handleRecruitmentSelect(job);
                setExpandedRecruitment(isExpanded ? null : job._id);
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
              <ChevronRight size={18} className={`arrow-icon ${isExpanded ? "arrow-rotated" : ""}`} />
            </div>

            {/* UNIFIED DROP-DOWN PANEL FOR BOTH MOBILE AND DESKTOP */}
            {isExpanded && (
              <div className="unified-paper-dropdown-panel">
                {papersLoading ? (
                  <div className="spinner-container-inline">
                    <Loader2 className="spinner-icon animated-spin" size={20} />
                    <span className="spinner-text">Loading Booklet Layer....</span>
                  </div>
                ) : papers.length > 0 ? (
                  <div className="papers-inline-grid">
                    {papers.map((paper) => {
                      const displayYear = paper.examDate
                        ? new Date(paper.examDate).getFullYear()
                        : "N/A";

                      return (
                        <div key={paper._id} className="inline-paper-row-card">
                          <div className="paper-heading-specs">
                            <h4>{paper.paperTitle}</h4>
                            <p>
                              Questions: <strong>{paper.totalQuestions || 0}</strong> MCQs | 
                              Marks: <strong>{paper.totalMarks || 0}</strong> | 
                              Year: <strong>{displayYear}</strong>
                            </p>
                          </div>

                          <div className="action-buttons-row">
                            {/* BUTTON 1: PRACTICE MODE WITH CACHE FLUSH */}
                            <button
                              className="btn-action practice-mode-btn"
                              onClick={() => {
                                localStorage.removeItem(`userAnswers_${paper._id}`);
                                localStorage.removeItem(`bookmarks_${paper._id}`);
                                navigate(`/quiz?mode=practice&paperId=${paper._id}`);
                              }}
                            >
                              Practice Mode
                            </button>

                            {/* BUTTON 2: MOCK TEST WITH CACHE FLUSH */}
                            <button
                              className="btn-action mock-mode-btn"
                              onClick={() => {
                                localStorage.removeItem(`userAnswers_${paper._id}`);
                                localStorage.removeItem(`bookmarks_${paper._id}`);
                                navigate(`/quiz?mode=mock&paperId=${paper._id}`);
                              }}
                            >
                              Mock Test
                            </button>

                            {/* BUTTON 3: PDF EMBED ATTACHMENT LINK */}
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
                    })}
                  </div>
                ) : (
                  <p className="empty-papers-prompt">No examination booklets linked to this recruitment category profile yet.</p>
                )}
              </div>
            )}
          </div>
        );
      })
    ) : (
      <p className="empty-prompt">
        No active Recruitment configured for this Authority yet.
      </p>
    )}
  </div>
</div>

      </div>
    </div>
  );
}

export default Practice;
