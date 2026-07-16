import React, { useState, useEffect, useContext, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Info,
  FileText,
  Video,
  CheckCircle2,
  XCircle,
  Badge,
} from "lucide-react";
import { AppContext } from "../context/AppContext.jsx";
import { useUser } from "@clerk/clerk-react";
import QuizSummary from "./QuizSummary.jsx"; // 🌟 Import your premium summary layout page component

const QuizEngine = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { backendUrl, userData } = useContext(AppContext);

  // --- Parse parameters straight from the browser URL path string ---
  const queryParams = new URLSearchParams(location.search);
  const quizMode = queryParams.get("mode") || "practice";
  const paperId = queryParams.get("paperId");
  const currentAffairsId = queryParams.get("currentAffairsId");

  const isMockMode = () => quizMode === "mock";
  const isPracticeMode = () => quizMode === "practice";

  // ==========================================================================
  // STATE DEFINITIONS
  // ==========================================================================
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [bookmarks, setBookmarks] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [paperDetails, setPaperDetails] = useState(null);
  const [showResultsSection, setShowResultsSection] = useState(false);

  // 🌟 Expanded summary stats dictionary state to hold premium parameters cleanly
  const [resultsData, setResultsData] = useState({
    total: 0,
    correct: 0,
    wrong: 0,
    skipped: 0,
    accuracy: "0%",
    score: 0,
    totalMarks: 0,
    timeTakenString: "0 mins 0 secs",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeTooltipId, setActiveTooltipId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const timerIntervalRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  // FETCH QUESTIONS & PAPER DETAILS LIVE FROM MONGODB ATLAS
  // ==========================================================================
  useEffect(() => {
    const fetchExamModuleData = async () => {
      // 🌟 1. VALIDATION GATE: Ensure at least one reference pointer exists
      if (!paperId && !currentAffairsId) {
        toast.error("Invalid Exam reference pointer.");
        navigate("/practice");
        return;
      }

      setIsLoading(true);
      try {
        let questionsRes;
        let totalSecondsAllowed = 3600; // Baseline fallback default (1 hour)

        // ========================================================
        // BRANCH A: CURRENT AFFAIRS REVISION QUIZ PIPELINE
        // ========================================================
        if (currentAffairsId) {
          const caUrl =
            `${backendUrl}/api/current-affairs/${currentAffairsId}/questions`.replace(
              /([^:]\/)\/+/g,
              "$1",
            );

          questionsRes = await axios.get(caUrl, { withCredentials: true });

          // Parse questions from flat array or standardized object structure
          const parsedQuestions = Array.isArray(questionsRes.data)
            ? questionsRes.data
            : questionsRes.data.questions || [];

          if (parsedQuestions.length > 0) {
            setQuestions(parsedQuestions);
          } else {
            toast.warning(
              "This current affairs issue has no questions uploaded yet.",
            );
            navigate("/current-affairs");
            return;
          }

          // Set paper metadata placeholders to keep your scoreboard view safe
          setPaperDetails({
            title: "Weekly Current Affairs Revision Quiz",
            timeAllowed: 30, // Assign a default 30 minutes allowance for CA revision
          });
          totalSecondsAllowed = 30 * 60;

          document.title = "Current Affairs Quiz | Megha Quiz App";

          // Handle separate localStorage caching for Current Affairs to prevent collisions
          const cachedAnswers = localStorage.getItem(
            `userAnswers_ca_${currentAffairsId}`,
          );
          const cachedBookmarks = localStorage.getItem(
            `bookmarks_ca_${currentAffairsId}`,
          );
          if (cachedAnswers) setUserAnswers(JSON.parse(cachedAnswers));
          if (cachedBookmarks) setBookmarks(JSON.parse(cachedBookmarks));
        }

        // ========================================================
        // BRANCH B: LEGACY AUTHORITY PAPERS PIPELINE (UNTOUCHED)
        // ========================================================
        else if (paperId) {
          const questionsUrl =
            `${backendUrl}/api/question?paperId=${paperId}`.replace(
              /([^:]\/)\/+/g,
              "$1",
            );
          const paperUrl = `${backendUrl}/api/paper/${paperId}`.replace(
            /([^:]\/)\/+/g,
            "$1",
          );

          const [qRes, pRes] = await Promise.all([
            axios.get(questionsUrl, { withCredentials: true }),
            axios.get(paperUrl, { withCredentials: true }).catch(() => null),
          ]);

          if (
            qRes.data.success &&
            qRes.data.questions &&
            qRes.data.questions.length > 0
          ) {
            setQuestions(qRes.data.questions);
          } else {
            toast.warning("This exam paper has no questions uploaded yet.");
            navigate("/practice");
            return;
          }

          if (pRes && pRes.data.success && pRes.data.paper) {
            const paperMeta = pRes.data.paper;
            setPaperDetails(paperMeta);
            totalSecondsAllowed = (paperMeta.timeAllowed || 60) * 60;
          }

          document.title =
            quizMode === "mock"
              ? "Mock Test | Megha Quiz App"
              : "Practice Mode | Megha Quiz App";

          const cachedAnswers = localStorage.getItem(`userAnswers_${paperId}`);
          const cachedBookmarks = localStorage.getItem(`bookmarks_${paperId}`);
          if (cachedAnswers) setUserAnswers(JSON.parse(cachedAnswers));
          if (cachedBookmarks) setBookmarks(JSON.parse(cachedBookmarks));
        }

        // 🌟 2. START ENGINE RUNTIME CONSTANTS
        setTimeRemaining(totalSecondsAllowed);
        startTimeRef.current = Date.now(); // Start precision timer counter
      } catch (err) {
        console.error("API Retrieval Failure:", err);
        toast.error("Failed to connect to fullstack database clusters.");
        navigate("/practice");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExamModuleData();
    // Include currentAffairsId inside dependency matrix array mapping
  }, [backendUrl, paperId, currentAffairsId, quizMode, navigate]);

  // COUNTDOWN TEST CLOCK CONTROLLER (MOCK EXCLUSIVE)
  // ==========================================================================
  useEffect(() => {
    // 🌟 Wait until timeRemaining is populated from the database before starting the clock ticker loop
    if (
      questions.length === 0 ||
      showResultsSection ||
      isLoading ||
      timeRemaining <= 0
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
  }, [questions, showResultsSection, userAnswers, isLoading, timeRemaining]);

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

    // Calculate precision time duration spent on test execution session
    const timeSpentMs = Date.now() - startTimeRef.current;
    const totalSecsSpent = Math.floor(timeSpentMs / 1000);
    const spentMins = Math.floor(totalSecsSpent / 60);
    const spentSecs = totalSecsSpent % 60;

    const finalScoreCalculated = correct * 2; // 2 Marks per item reference
    const maxPossibleMarks = questions.length * 2;

    const finalResults = {
      total: questions.length,
      correct,
      wrong,
      skipped: unanswered,
      accuracy: `${accuracy}%`,
      score: finalScoreCalculated,
      totalMarks: maxPossibleMarks,
      timeTakenString: `${spentMins} mins ${spentSecs} secs`,
    };

    setResultsData(finalResults);
    setIsSubmitted(true);
    setShowResultsSection(true);

    // 🌟 BRANCH CACHE FLUSH: Clean the correct isolated storage parameters
    if (currentAffairsId) {
      localStorage.removeItem(`userAnswers_ca_${currentAffairsId}`);
      console.log(
        "Cleaned localized Current Affairs runtime progress cache keys.",
      );
    } else {
      localStorage.removeItem(`userAnswers_${paperId}`);
    }

    try {
      const targetUrl = `${backendUrl}/api/quiz/leaderboard/submit`.replace(
        /([^:]\/)\/+/g,
        "$1",
      );

      // 🌟 FIXED PAYLOAD: Explicitly send both variables and the correct quiz type to the controller!
      await axios.post(
        targetUrl,
        {
          userId: userData?._id || "guest",
          paperId: currentAffairsId ? null : paperId,
          currentAffairsId: currentAffairsId || null,
          quizType: currentAffairsId ? "currentAffairs" : "regularPaper",
          score: finalScoreCalculated,
          totalQuestions: questions.length,
          accuracy,
          mode: quizMode || "practice",
        },
        { withCredentials: true },
      );
      console.log(
        "⚡ Quiz history record saved successfully to MongoDB Atlas!",
      );
    } catch (err) {
      console.error("Leaderboard/History transmission dropped:", err);
    }
  };

  // Safe checks for layout references
  if (isLoading)
    return (
      <div className="quiz-loading-container">Loading engine modules...</div>
    );

  // 🌟 INTERCEPT MOUNT: Switch viewport focus to premium results component!
  if (isSubmitted) {
    return (
      <QuizSummary
        quizMode={quizMode}
        evaluationMetrics={resultsData}
        questionsRawList={questions}
        submittedAnswers={userAnswers}
      />
    );
  }

  const activeQuestion = questions[currentQuestionIndex];
  const activeUserSelection = userAnswers[activeQuestion?._id];
  const isQuestionBookmarked = bookmarks.includes(activeQuestion?._id);

  return (
    <div className="quiz-engine-page-wrapper">
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

            {timeRemaining > 0 && (
              <div id="timerContainer" className="timer-container">
                <span className="timer-label">Time</span>
                <span
                  id="timer"
                  style={{ fontFamily: "monospace", fontWeight: "bold" }}
                >
                  {formatTimer()}
                </span>
              </div>
            )}
          </header>

          <div className="question-status">
            Status:{" "}
            <strong id="questionStatus">
              {activeUserSelection !== undefined ? "Answered" : "Not Attempted"}
            </strong>
          </div>

          <article className="question-card">
            {activeQuestion?.sectionTitle && (
              <div
                className="section-title-badge"
                style={{
                  backgroundColor: "#eff6ff",
                  color: "#1e40af",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  display: "inline-block",
                  fontSize: "13px",
                  fontWeight: "600",
                  marginBottom: "12px",
                }}
              >
                📚 Section: {activeQuestion.sectionTitle}
              </div>
            )}
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

            {/* FIXED SECTION BELOW */}
            <div
              id="questionText"
              dangerouslySetInnerHTML={{ __html: activeQuestion?.question || "" }}
            />

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
              const isSelected = activeUserSelection === letter;

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
                  onClick={() => handleSelectAnswer(letter)}
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

          <div
            className="question-navigation"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <button
              id="prevBtn"
              onClick={() =>
                setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
              }
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </button>

            {/* 🌟 Added YouTube Video Solution Walkthrough Trigger Button Link */}
            {isPracticeMode() &&
              activeUserSelection !== undefined &&
              activeQuestion?.youtube && (
                <a
                  href={activeQuestion.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-video-solution"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 16px",
                    background: "#fef2f2",
                    color: "#dc2626",
                    border: "1px solid #fca5a5",
                    borderRadius: "6px",
                    textDecoration: "none",
                    fontWeight: "500",
                    fontSize: "14px",
                  }}
                >
                  <Video size={16} /> Watch Video Solution
                </a>
              )}

            <button id="nextBtn" onClick={handleNextBtnClick}>
              {currentQuestionIndex === questions.length - 1
                ? isMockMode()
                  ? "Submit Test"
                  : "Submit Practice"
                : "Next"}
            </button>
          </div>
        </section>

        {/* RIGHT DOCK READING COMPREHENSION PASSAGE CONTAINER BOX */}
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
              minHeight: "450px",
              maxHeight: "calc(100vh - 180px)",
              overflowY: "auto",
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
          <div
            className="quiz-passage-placeholder"
            style={{ opacity: 0, width: "100%" }}
          ></div>
        )}
      </main>
    </div>
  );
};

export default QuizEngine;
