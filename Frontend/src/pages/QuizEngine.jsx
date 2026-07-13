import React, { useState, useEffect, useContext, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Info, FileText, Video, CheckCircle2, XCircle } from "lucide-react";
import { AppContext } from "../context/AppContext.jsx";
import { useUser } from "@clerk/clerk-react"; // 🌟 ADD THIS

const QuizEngine = () => {
  const { user, isLoaded } = useUser(); 
  const navigate = useNavigate();
  const location = useLocation();
  const { backendUrl, userData } = useContext(AppContext);

  // --- Parse parameters straight from the browser URL path string ---
  const queryParams = new URLSearchParams(location.search);
  const quizMode = queryParams.get("mode") || "practice";
  const paperId = queryParams.get("paperId");

  const isMockMode = () => quizMode === "mock";
  const isPracticeMode = () => quizMode === "practice";

  // ==========================================================================
  // STATE DEFINITIONS
  // ==========================================================================
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [bookmarks, setBookmarks] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(3600);
  const [showResultsSection, setShowResultsSection] = useState(false);
  const [resultsData, setResultsData] = useState({
    total: 0,
    correct: 0,
    wrong: 0,
    accuracy: "0%",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeTooltipId, setActiveTooltipId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const timerIntervalRef = useRef(null);

  // ==========================================================================
  // FETCH QUESTIONS LIVE FROM MONGODB ATLAS
  // ==========================================================================
  useEffect(() => {
    const fetchLiveQuestions = async () => {
      if (!paperId) {
        toast.error("Invalid Exam Paper reference pointer.");
        navigate("/practice");
        return;
      }

      setIsLoading(true);
      try {
        const targetUrl =
          `${backendUrl}/api/question?paperId=${paperId}`.replace(
            /([^:]\/)\/+/g,
            "$1",
          );

        const response = await axios.get(targetUrl, { withCredentials: true });

        if (
          response.data.success &&
          response.data.questions &&
          response.data.questions.length > 0
        ) {
          setQuestions(response.data.questions);
        } else {
          toast.warning("This exam paper has no questions uploaded yet.");
          navigate("/practice");
          return;
        }

        document.title = isMockMode()
          ? "Mock Test | Megha Quiz App"
          : "Practice Mode | Megha Quiz App";

        const cachedAnswers = localStorage.getItem(`userAnswers_${paperId}`);
        const cachedBookmarks = localStorage.getItem(`bookmarks_${paperId}`);
        if (cachedAnswers) setUserAnswers(JSON.parse(cachedAnswers));
        if (cachedBookmarks) setBookmarks(JSON.parse(cachedBookmarks));
      } catch (err) {
        console.error("API Retrieval Failure:", err);
        toast.error("Failed to connect to fullstack database clusters.");
        navigate("/practice");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLiveQuestions();
  }, [backendUrl, paperId, quizMode, navigate]);

  // COUNTDOWN TEST CLOCK CONTROLLER (MOCK EXCLUSIVE)
  // ==========================================================================
  useEffect(() => {
    if (
      !isMockMode() ||
      questions.length === 0 ||
      showResultsSection ||
      isLoading
    )
      return;

    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerIntervalRef.current);
          alert("Time is up! Test submitted automatically.");
          executeShowResults(userAnswers);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [questions, showResultsSection, userAnswers, isLoading]);

  const formatTimer = () => {
    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const handleSelectAnswer = (selectedLetter) => {
    if (showResultsSection) return;

    const activeQuestionId = questions[currentQuestionIndex]?._id;
    if (isPracticeMode() && userAnswers[activeQuestionId] !== undefined) return;

    const updatedAnswers = {
      ...userAnswers,
      [activeQuestionId]: selectedLetter,
    };

    setUserAnswers(updatedAnswers);
    localStorage.setItem(
      `userAnswers_${paperId}`,
      JSON.stringify(updatedAnswers),
    );
  };

  const handleToggleBookmark = () => {
    const activeQuestionId = questions[currentQuestionIndex]?._id;
    if (!activeQuestionId) return;

    let updatedBookmarks;
    if (bookmarks.includes(activeQuestionId)) {
      updatedBookmarks = bookmarks.filter((id) => id !== activeQuestionId);
    } else {
      updatedBookmarks = [...bookmarks, activeQuestionId];
    }

    setBookmarks(updatedBookmarks);
    localStorage.setItem(
      `bookmarks_${paperId}`,
      JSON.stringify(updatedBookmarks),
    );
  };

  const handleNextBtnClick = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleSubmitPractice();
    }
  };

  const handleSubmitPractice = () => {
    const msg = isMockMode() ? "Submit Mock Test?" : "Submit Practice?";
    if (!window.confirm(msg)) return;
    executeShowResults(userAnswers);
  };

  const executeShowResults = async (answersToEvaluate) => {
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;

    questions.forEach((q) => {
      const selected = answersToEvaluate[q._id];
      if (selected === undefined) unanswered++;
      else if (selected === q.answerKey) correct++;
      else wrong++;
    });

    const attempted = correct + wrong;
    const accuracy = attempted ? Math.round((correct / attempted) * 100) : 0;

    setResultsData({
      total: questions.length,
      correct,
      wrong,
      accuracy: `${accuracy}%`,
    });

    setIsSubmitted(true);
    setShowResultsSection(true);

    try {
      const targetUrl = `${backendUrl}/api/quiz/leaderboard/submit`.replace(
        /([^:]\/)\/+/g,
        "$1",
      );
      await axios.post(
        targetUrl,
        {
          userId: userData?._id || "guest",
          paperId,
          score: correct,
          totalQuestions: questions.length,
          accuracy,
        },
        { withCredentials: true },
      );
    } catch (err) {
      console.error("Leaderboard transmission dropped:", err);
    }
  };

  // Safe checks for layout references
  if (isLoading)
    return (
      <div className="quiz-loading-container">Loading engine modules...</div>
    );

  const activeQuestion = questions[currentQuestionIndex];
  const activeUserSelection = userAnswers[activeQuestion?._id];
  const isQuestionBookmarked = bookmarks.includes(activeQuestion?._id);

  return (
    <div className="quiz-engine-page-wrapper">
      {!isSubmitted ? (
        <main className="practice-layout" id="quizLayout">
          {/* PALETTE NAVIGATION SIDEBAR */}
          <aside className="question-sidebar" id="questionSidebar">
            <div className="sidebar-header">
              <h2>Question Palette</h2>
            </div>
            <div className="candidate-info">
              <h3>Candidate</h3>
              <p id="candidateName">
                {!isLoaded ? "Loading..." : user?.fullName || "Guest User"}
              </p>
            </div>

            <div className="question-summary">
              <div className="summary-item">
                <span id="answeredCount" className="summary-count">
                  {Object.keys(userAnswers).length}
                </span>
                <span>Answered</span>
              </div>
              <div className="summary-item">
                <span id="unansweredCount" className="summary-count">
                  {questions.length - Object.keys(userAnswers).length}
                </span>
                <span>Unanswered</span>
              </div>
              <div className="summary-item">
                <span id="bookmarkCount" className="summary-count">
                  {bookmarks.length}
                </span>
                <span>Bookmarked</span>
              </div>
            </div>

            <div id="questionPalette" className="question-palette">
              {questions.map((q, i) => {
                let btnClass = "question-number";
                if (i === currentQuestionIndex) btnClass += " current";
                // ✅ Evaluates using the MongoDB _id key to apply colors to the answered palette nodes
                if (userAnswers[q._id] !== undefined) btnClass += " attempted";

                return (
                  <button
                    key={q._id}
                    type="button"
                    className={btnClass}
                    onClick={() => setCurrentQuestionIndex(i)}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <div className="palette-legend">
              <div>
                <span className="legend-box unanswered"></span>Unanswered
              </div>
              <div>
                <span className="legend-box attempted"></span>Answered
              </div>
              <div>
                <span className="legend-box current-view"></span>Current
              </div>
            </div>

            <button
              id="submitPracticeBtn"
              className="submit-practice-btn"
              onClick={handleSubmitPractice}
            >
              {isMockMode() ? "Submit Test" : "Submit Practice"}
            </button>
          </aside>

          {/* EXAM CORE CARD PLATFORM */}
          <section className="quiz-section">
            <header className="exam-header">
              <div className="quiz-info">
                <span id="questionCounter">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
              </div>

              {isMockMode() && (
                <div id="timerContainer" className="timer-container">
                  <span className="timer-label">Time</span>
                  <span id="timer">{formatTimer()}</span>
                </div>
              )}
            </header>

            <div className="question-status">
              Status:{" "}
              <strong id="questionStatus">
                {activeUserSelection !== undefined
                  ? "Answered"
                  : "Not Attempted"}
              </strong>
            </div>

            <article className="question-card">
              <div className="question-header">
                <h2 id="questionTitle">Question {currentQuestionIndex + 1}</h2>
                {isPracticeMode() && (
                  <button
                    id="bookmarkBtn"
                    className={isQuestionBookmarked ? "bookmarked" : ""}
                    onClick={handleToggleBookmark}
                  >
                    {isQuestionBookmarked ? "★ Bookmarked" : "☆ Bookmark"}
                  </button>
                )}
              </div>

              <div id="questionText">{activeQuestion?.question}</div>

              {activeQuestion?.questionImage && (
                <div className="question-image-container">
                  <img
                    id="questionImage"
                    src={activeQuestion.questionImage}
                    alt="Figure Model Graph Reference"
                  />
                </div>
              )}
            </article>

            {/* SELECTION BUTTON OPTIONS */}
            <section id="optionsContainer" className="options-section">
              {activeQuestion?.options.map((opt, index) => {
                const letter = ["A", "B", "C", "D"][index];
                let optionClass = "option-btn";

                // ✅ Matches against your string states ("A", "B", etc.)
                const isSelected = activeUserSelection === letter;

                // 🌟 EVALUATION COLOR LOGIC FIX
                if (isPracticeMode() && activeUserSelection !== undefined) {
                  if (letter === activeQuestion.answerKey) {
                    optionClass += " correct-answer";
                  } else if (isSelected) {
                    optionClass += " wrong-answer";
                  }
                } else if (isSelected) {
                  optionClass += " selected-option";
                }

                return (
                  <button
                    key={index}
                    type="button"
                    className={optionClass}
                    onClick={() => handleSelectAnswer(letter)} // ✅ Transmits "A", "B" etc.
                    disabled={
                      isPracticeMode() && activeUserSelection !== undefined
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      textAlign: "left",
                    }}
                  >
                    {/* Explicit visual tag separating letters cleanly from your database text values */}
                    <span
                      style={{
                        fontWeight: "bold",
                        opacity: 0.6,
                        minWidth: "20px",
                      }}
                    >
                      {letter}.
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </section>

            {isPracticeMode() &&
              activeUserSelection !== undefined &&
              activeQuestion?.solution && (
                <section
                  id="solutionContainer"
                  className="solution-container"
                  style={{ display: "block", marginTop: "20px" }}
                >
                  <h3>Solution & Explanation</h3>
                  <p>{activeQuestion.solution}</p>
                </section>
              )}

            <div className="question-navigation">
              <button
                id="prevBtn"
                onClick={() =>
                  setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
                }
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </button>
              <button id="nextBtn" onClick={handleNextBtnClick}>
                {currentQuestionIndex === questions.length - 1
                  ? isMockMode()
                    ? "Submit Test"
                    : "Submit Practice"
                  : "Next"}
              </button>
            </div>
          </section>

          {/* 📖 1. PASSAGE CONTAINER (Injects beautifully between global grid slots) */}
          {/* ========================================================================== */}
          {/* 📖 COLUMN 3: RIGHT PANEL TALL PASSAGE DESIGN CARD */}
          {/* ========================================================================== */}
          {activeQuestion?.passage ? (
            <div
              className="quiz-passage-box"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "24px",
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",

                // 🔄 HEIGHT MODIFICATION SETTINGS:
                minHeight: "450px", // Guarantees it won't be too short
                maxHeight: "calc(100vh - 180px)", // Stretches dynamically based on screen size
                overflowY: "auto", // Keeps internal scrolling enabled

                position: "sticky",
                top: "24px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "12px",
                  textTransform: "uppercase",
                  marginBottom: "14px",
                  color: "#2563eb",
                  letterSpacing: "0.5px",
                  borderBottom: "1px solid #f3f4f6",
                  paddingBottom: "8px",
                }}
              >
                📖 Reading Comprehension Passage
              </div>

              <p
                style={{
                  margin: 0,
                  fontSize: "14.5px",
                  color: "#374151",
                  lineHeight: "1.7",
                  whiteSpace: "pre-line",
                  fontStyle: "italic",
                  fontFamily: "Georgia, serif",
                }}
              >
                {activeQuestion.passage}
              </p>
            </div>
          ) : (
            /* Keeps grid architecture aligned when questions don't require text passages */
            <div
              className="quiz-passage-placeholder"
              style={{ opacity: 0, width: "100%" }}
            ></div>
          )}
        </main>
      ) : (
        <main className="results-review-dashboard">
          {/* STATS OVERVIEW HEADER */}
          <section
            className="results-section"
            style={{ margin: "0 auto 40px auto", padding: "24px" }}
          >
            <h2>{isMockMode() ? "Mock Test Summary" : "Practice Summary"}</h2>
            <div
              className="results-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "16px",
                margin: "20px 0",
              }}
            >
              <div className="result-card">
                <h3>Total Questions</h3>
                <p>{resultsData.total}</p>
              </div>
              <div className="result-card">
                <h3>Correct</h3>
                <p>{resultsData.correct}</p>
              </div>
              <div className="result-card">
                <h3>Wrong</h3>
                <p>{resultsData.wrong}</p>
              </div>
              <div className="result-card">
                <h3>Accuracy</h3>
                <p>{resultsData.accuracy}</p>
              </div>
            </div>
            <button
              id="restartBtn"
              className="submit-practice-btn"
              style={{
                maxWidth: "250px",
                margin: "20px auto 0 auto",
                display: "block",
              }}
              onClick={() => navigate("/practice")}
            >
              Finish & Exit
            </button>
          </section>
        </main>
      )}
    </div>
  );
};

export default QuizEngine;
