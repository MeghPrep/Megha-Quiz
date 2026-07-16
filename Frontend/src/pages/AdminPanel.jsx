import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext.jsx";
import {
  PlusCircle,
  Layers,
  HelpCircle,
  Link2,
  Edit3,
  Trash2,
  XCircle,
} from "lucide-react";

// Link stylesheet via relative path
import "../assets/AdminPanel.css";

function AdminPanel() {
  const { backendUrl, userId } = useContext(AppContext);

  // Structural cascading collections loaded from MongoDB Atlas
  const [authorities, setAuthorities] = useState([]);
  const [recruitments, setRecruitments] = useState([]);
  const [papers, setPapers] = useState([]);
  const [existingQuestions, setExistingQuestions] = useState([]); // 🌟 Stores live questions for current booklet

  // Form Cascading Select Target State IDs
  const [selectedAuthorityId, setSelectedAuthorityId] = useState("");
  const [selectedRecruitmentId, setSelectedRecruitmentId] = useState("");
  const [selectedPaperId, setSelectedPaperId] = useState("");

  // CRUD Mode Toggles
  const [isEditingQuestion, setIsEditingQuestion] = useState(false); // 🌟 Tracks if form is in edit mode
  const [editingQuestionId, setEditingQuestionId] = useState(null); // 🌟 Stores _id of live document being updated
  const [isCreatingPaper, setIsCreatingPaper] = useState(false);

  const [newPaperForm, setNewPaperForm] = useState({
    paperTitle: "",
    examDate: "",
    timeAllowed: 60,
    totalMarks: 100,
    totalQuestions: 50,
    negativeMarking: false,
    examCode: "",
  });

  // Core Question Schema Input Fields Matching backend/model/questions.js
  const [questionForm, setQuestionForm] = useState({
    questionNumber: 1,
    sectionTitle: "",
    passage: "",
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    answerKey: "A",
    solution: "",
    youtube: "",
  });

  const [loading, setLoading] = useState(false);

  // 1. Fetch Authorities list on component mount
  useEffect(() => {
    const fetchAuthorities = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/authority`);
        if (response.data.success) setAuthorities(response.data.authorities);
      } catch (err) {
        toast.error("Failed to load active Authorities into dropdown menu.");
      }
    };
    fetchAuthorities();
  }, [backendUrl]);

  // 2. Load nested Recruitments automatically when Parent Authority changes
  useEffect(() => {
    if (!selectedAuthorityId) {
      setRecruitments([]);
      setPapers([]);
      setExistingQuestions([]);
      setSelectedRecruitmentId("");
      setSelectedPaperId("");
      resetQuestionForm();
      return;
    }
    const fetchRecruitments = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/recruitment?authorityId=${selectedAuthorityId}`,
        );
        if (response.data.success) setRecruitments(response.data.recruitment);
      } catch (err) {
        toast.error("Error loading nested recruitments for this selection.");
      }
    };
    fetchRecruitments();
  }, [selectedAuthorityId, backendUrl]);

  // 3. Load nested Papers automatically when Recruitment tier shifts
  useEffect(() => {
    if (!selectedRecruitmentId) {
      setPapers([]);
      setExistingQuestions([]);
      setSelectedPaperId("");
      resetQuestionForm();
      return;
    }
    const fetchPapers = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/paper?recruitmentId=${selectedRecruitmentId}`,
        );
        if (response.data.success) setPapers(response.data.papers);
      } catch (err) {
        toast.error("Error fetching examination question papers.");
      }
    };
    fetchPapers();
  }, [selectedRecruitmentId, backendUrl]);

  // 🌟 4. Fetch all live booklet questions whenever selected paper changes
  const fetchBookletQuestions = async (paperId) => {
    if (!paperId) {
      setExistingQuestions([]);
      return;
    }
    try {
      const response = await axios.get(
        `${backendUrl}/api/question?paperId=${paperId}`,
      );
      if (response.data.success) {
        // Sort chronologically by question number row indices
        const sorted = response.data.questions.sort(
          (a, b) => a.questionNumber - b.questionNumber,
        );
        setExistingQuestions(sorted);
      }
    } catch (err) {
      console.error("Failed to load live question feeds:", err);
    }
  };

  useEffect(() => {
    fetchBookletQuestions(selectedPaperId);
    resetQuestionForm();
  }, [selectedPaperId]);

  // Reset form status completely
  const resetQuestionForm = () => {
    setIsEditingQuestion(false);
    setEditingQuestionId(null);
    setQuestionForm({
      questionNumber: existingQuestions.length + 1,
      sectionTitle: "",
      passage: "",
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      answerKey: "A",
      solution: "",
      youtube: "",
    });
  };

  // Populate data fields into entry layout block for dynamic modifications
  const handleTriggerEdit = (q) => {
    setIsEditingQuestion(true);
    setEditingQuestionId(q._id);
    setQuestionForm({
      questionNumber: q.questionNumber,
      sectionTitle: q.sectionTitle || "",
      passage: q.passage || "",
      question: q.question,
      optionA: q.options[0] || "",
      optionB: q.options[1] || "",
      optionC: q.options[2] || "",
      optionD: q.options[3] || "",
      answerKey: q.answerKey,
      solution: q.solution || "",
      youtube: q.youtube || "",
    });
    window.scrollTo({ top: 350, behavior: "smooth" });
    toast.info(`Editing Question #${q.questionNumber}`);
  };

  // Handle removing a question permanently from your Atlas Cluster
  const handleDeleteQuestion = async (id, qNum) => {
    if (
      !window.confirm(
        `Are you absolutely sure you want to delete Question #${qNum}?`,
      )
    )
      return;
    try {
      const response = await axios.delete(`${backendUrl}/api/question/${id}`);
      if (response.data.success) {
        toast.success(`Question #${qNum} removed successfully.`);
        fetchBookletQuestions(selectedPaperId);
        if (editingQuestionId === id) resetQuestionForm();
      }
    } catch (err) {
      toast.error("Failed to delete selected question record row.");
    }
  };

  // Handle submitting a newly initialized Paper structural record row
  const handleCreatePaper = async (e) => {
    e.preventDefault();
    if (!selectedRecruitmentId) {
      toast.warning("Please select a parent recruitment framework first.");
      return;
    }
    try {
      const payload = { recruitment: selectedRecruitmentId, ...newPaperForm };
      const response = await axios.post(`${backendUrl}/api/paper`, payload);
      if (response.data.success) {
        toast.success("New examination paper tier registered successfully!");
        setPapers([...papers, response.data.paper]);
        setSelectedPaperId(response.data.paper._id);
        setIsCreatingPaper(false);
        setNewPaperForm({
          paperTitle: "",
          examDate: "",
          timeAllowed: 60,
          totalMarks: 100,
          totalQuestions: 50,
          negativeMarking: false,
          examCode: "",
        });
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to finalize new paper mapping.",
      );
    }
  };

  // Handle processing and pushing complete MCQ questions upstream (Dual-Mode: Create vs. Update)
  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPaperId) {
      toast.warning(
        "Please choose or target an explicit exam paper module container first.",
      );
      return;
    }

    setLoading(true);
    const optionsArray = [
      questionForm.optionA.trim(),
      questionForm.optionB.trim(),
      questionForm.optionC.trim(),
      questionForm.optionD.trim(),
    ];

    const payload = {
      paper: selectedPaperId,
      questionNumber: Number(questionForm.questionNumber),
      sectionTitle: questionForm.sectionTitle.trim(),
      passage: questionForm.passage.trim(),
      question: questionForm.question.trim(),
      options: optionsArray,
      answerKey: questionForm.answerKey,
      solution: questionForm.solution.trim(),
      youtube: questionForm.youtube.trim(),
      createdBy: userId || "AdminManualEntry",
    };

    try {
      let response;
      if (isEditingQuestion) {
        // 🌟 HIT PUT ROUTE MAPPING INSTEAD
        response = await axios.put(
          `${backendUrl}/api/question/${editingQuestionId}`,
          payload,
        );
      } else {
        // HIT STANDARD INITIAL UPLOAD ROUTE
        response = await axios.post(`${backendUrl}/api/question`, payload);
      }

      if (response.data.success) {
        toast.success(
          isEditingQuestion
            ? "Question updated successfully!"
            : "MCQ Question uploaded to Atlas successfully!",
        );
        fetchBookletQuestions(selectedPaperId);

        if (isEditingQuestion) {
          resetQuestionForm();
        } else {
          setQuestionForm((prev) => ({
            ...prev,
            questionNumber: prev.questionNumber + 1,
            question: "",
            optionA: "",
            optionB: "",
            optionC: "",
            optionD: "",
            solution: "",
            youtube: "",
          }));
        }
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to append question to backend context.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-panel-layout-wrapper">
      <div className="admin-hero-banner">
        <h1>Megha Quiz Admin Control Panel</h1>
        <p>
          Digitize official MPSC exam question booklets, link parent structural
          workflows, and manage keys cleanly.
        </p>
      </div>

      <div className="admin-container">
        {/* SECTION 1: RELATIONAL STRUCTURAL HOOKING */}
        <section className="admin-card-section">
          <h2>
            <Layers size={18} /> Step 1: Target Relational Nesting Cascade
          </h2>
          <div className="admin-selection-grid">
            <div className="admin-input-group">
              <label>Select Parent Authority Cadre</label>
              <select
                value={selectedAuthorityId}
                onChange={(e) => {
                  setSelectedAuthorityId(e.target.value);
                  setSelectedRecruitmentId("");
                  setSelectedPaperId("");
                }}
              >
                <option value="">-- Choose Authority --</option>
                {authorities.map((a) => (
                  <option key={a._id} value={a.id}>
                    {a.name} ({a.shortName.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-input-group">
              <label>Select Parent Recruitment</label>
              <select
                value={selectedRecruitmentId}
                onChange={(e) => {
                  setSelectedRecruitmentId(e.target.value);
                  setSelectedPaperId("");
                }}
                disabled={!selectedAuthorityId}
              >
                <option value="">-- Choose Recruitment Framework --</option>
                {recruitments.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.postName} - ({r.advertisementYear})
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-input-group">
              <label>Select Target Question Paper Booklet</label>
              <div className="topic-select-row">
                <select
                  value={selectedPaperId}
                  onChange={(e) => setSelectedPaperId(e.target.value)}
                  disabled={isCreatingPaper || !selectedRecruitmentId}
                >
                  <option value="">-- Choose Target Paper --</option>
                  {papers.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.paperTitle}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="toggle-creation-btn"
                  onClick={() => setIsCreatingPaper(!isCreatingPaper)}
                  disabled={!selectedRecruitmentId}
                >
                  {isCreatingPaper ? "Cancel" : "Add New Paper"}
                </button>
              </div>
            </div>
          </div>

          {isCreatingPaper && (
            <form
              onSubmit={handleCreatePaper}
              className="inline-add-topic-form-expanded"
            >
              <h3>Create Missing Exam Booklet Frame</h3>
              <div className="options-input-grid">
                <input
                  type="text"
                  placeholder="Paper Title"
                  value={newPaperForm.paperTitle}
                  onChange={(e) =>
                    setNewPaperForm({
                      ...newPaperForm,
                      paperTitle: e.target.value,
                    })
                  }
                  required
                />
                <input
                  type="date"
                  value={newPaperForm.examDate}
                  onChange={(e) =>
                    setNewPaperForm({
                      ...newPaperForm,
                      examDate: e.target.value,
                    })
                  }
                  required
                />
                <input
                  type="number"
                  placeholder="Duration (Mins)"
                  value={newPaperForm.timeAllowed}
                  onChange={(e) =>
                    setNewPaperForm({
                      ...newPaperForm,
                      timeAllowed: e.target.value,
                    })
                  }
                  required
                />
                <input
                  type="number"
                  placeholder="Total Marks"
                  value={newPaperForm.totalMarks}
                  onChange={(e) =>
                    setNewPaperForm({
                      ...newPaperForm,
                      totalMarks: e.target.value,
                    })
                  }
                  required
                />
                <input
                  type="number"
                  placeholder="Total Questions"
                  value={newPaperForm.totalQuestions}
                  onChange={(e) =>
                    setNewPaperForm({
                      ...newPaperForm,
                      totalQuestions: e.target.value,
                    })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Exam Code"
                  value={newPaperForm.examCode}
                  onChange={(e) =>
                    setNewPaperForm({
                      ...newPaperForm,
                      examCode: e.target.value,
                    })
                  }
                />
                <label className="checkbox-holder">
                  <input
                    type="checkbox"
                    checked={newPaperForm.negativeMarking}
                    onChange={(e) =>
                      setNewPaperForm({
                        ...newPaperForm,
                        negativeMarking: e.target.checked,
                      })
                    }
                  />{" "}
                  Negative Marking?
                </label>
              </div>
              <button type="submit" className="btn-admin-submit">
                <PlusCircle size={16} /> Save New Paper Record
              </button>
            </form>
          )}
        </section>

        {/* SECTION 2: FORM BLOCK */}
        <form
          onSubmit={handleQuestionSubmit}
          className="admin-card-section input-forms-block"
        >
          <h2>
            <HelpCircle size={18} />
            {isEditingQuestion
              ? "Step 2: Modify Selected Live Question"
              : "Step 2: Input Question Content Fields"}
            {isEditingQuestion && (
              <button
                type="button"
                className="cancel-edit-pill"
                onClick={resetQuestionForm}
              >
                <XCircle size={14} /> Exit Edit Mode
              </button>
            )}
          </h2>

          <div
            className="options-input-grid"
            style={{ gridTemplateColumns: "1fr 2fr 2fr" }}
          >
            <div className="admin-input-group">
              <label>Question No.</label>
              <input
                type="number"
                min={1}
                value={questionForm.questionNumber}
                onChange={(e) =>
                  setQuestionForm({
                    ...questionForm,
                    questionNumber: e.target.value,
                  })
                }
                required
              />
            </div>
            <div className="admin-input-group">
              <label>Section Heading (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Indian Polity"
                value={questionForm.sectionTitle}
                onChange={(e) =>
                  setQuestionForm({
                    ...questionForm,
                    sectionTitle: e.target.value,
                  })
                }
              />
            </div>
            <div className="admin-input-group">
              <label>Correct Evaluation Answer Key</label>
              <select
                value={questionForm.answerKey}
                onChange={(e) =>
                  setQuestionForm({
                    ...questionForm,
                    answerKey: e.target.value,
                  })
                }
              >
                <option value="A">Option A</option>
                <option value="B">Option B</option>
                <option value="C">Option C</option>
                <option value="D">Option D</option>
              </select>
            </div>
          </div>

          <div className="admin-input-group full-width-field">
            <label>Comprehension Passage Text (Optional)</label>
            <textarea
              rows={2}
              placeholder="Paste common analytical passage block if needed..."
              value={questionForm.passage}
              onChange={(e) =>
                setQuestionForm({ ...questionForm, passage: e.target.value })
              }
            />
          </div>

          <div className="admin-input-group full-width-field">
            <label>Question Stem Core Text Statement</label>
            <textarea
              rows={3}
              placeholder="Type the core MCQ question query description prompt text here..."
              value={questionForm.question}
              onChange={(e) =>
                setQuestionForm({ ...questionForm, question: e.target.value })
              }
              required
            />
          </div>

          <div className="options-input-grid">
            <div className="admin-input-group">
              <label>Option A Content String</label>
              <input
                type="text"
                value={questionForm.optionA}
                onChange={(e) =>
                  setQuestionForm({ ...questionForm, optionA: e.target.value })
                }
                required
              />
            </div>
            <div className="admin-input-group">
              <label>Option B Content String</label>
              <input
                type="text"
                value={questionForm.optionB}
                onChange={(e) =>
                  setQuestionForm({ ...questionForm, optionB: e.target.value })
                }
                required
              />
            </div>
            <div className="admin-input-group">
              <label>Option C Content String</label>
              <input
                type="text"
                value={questionForm.optionC}
                onChange={(e) =>
                  setQuestionForm({ ...questionForm, optionC: e.target.value })
                }
                required
              />
            </div>
            <div className="admin-input-group">
              <label>Option D Content String</label>
              <input
                type="text"
                value={questionForm.optionD}
                onChange={(e) =>
                  setQuestionForm({ ...questionForm, optionD: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="admin-input-group full-width-field">
            <label>Detailed Solution Rationale & Explanations</label>
            <textarea
              rows={4}
              placeholder="Provide deep context, breakdown insights..."
              value={questionForm.solution}
              onChange={(e) =>
                setQuestionForm({ ...questionForm, solution: e.target.value })
              }
              required
            />
          </div>

          <h2>
            <Link2 size={18} /> Step 3: Embed Video Explanations (Optional)
          </h2>
          <div className="admin-input-group full-width-field">
            <label>YouTube Explanatory Video Link</label>
            <input
              type="url"
              placeholder="https://youtube.com..."
              value={questionForm.youtube}
              onChange={(e) =>
                setQuestionForm({ ...questionForm, youtube: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            className="master-upload-btn"
            style={{
              backgroundColor: isEditingQuestion ? "#3b82f6" : "#10b981",
            }}
            disabled={loading || !selectedPaperId}
          >
            {loading
              ? "Processing..."
              : isEditingQuestion
                ? "Update Live Question Record"
                : "Save and Upload Question Item"}
          </button>
        </form>

        {/* SECTION 3: BOOKLET QUESTIONS FEEDS INSPECTOR & LIST MANAGER */}
        {selectedPaperId && (
          <section className="admin-card-section questions-feed-list-inspector">
            <h2>
              Live Question Records Summary Map ({existingQuestions.length}{" "}
              Items)
            </h2>
            {existingQuestions.length === 0 ? (
              <p style={{ color: "#6b7280", fontStyle: "italic" }}>
                No questions have been uploaded to this booklet layer yet.
              </p>
            ) : (
              <div className="questions-dashboard-feed-table">
                {existingQuestions.map((q) => (
                  <div
                    key={q._id}
                    className={`question-feed-item-row ${editingQuestionId === q._id ? "row-actively-editing" : ""}`}
                  >
                    <div className="row-meta-content">
                      <span className="badge-q-number">
                        Q{q.questionNumber}
                      </span>
                      {q.sectionTitle && (
                        <span className="badge-section-title">
                          {q.sectionTitle}
                        </span>
                      )}
                      <p className="summary-stem-text">
                        {q.question.substring(0, 110)}
                        {q.question.length > 110 ? "..." : ""}
                      </p>
                      <div className="options-pill-grid">
                        <span
                          className={`opt-pill ${q.answerKey === "A" ? "is-correct-pill" : ""}`}
                        >
                          A: {q.options?.[0] || ""}
                        </span>
                        <span
                          className={`opt-pill ${q.answerKey === "B" ? "is-correct-pill" : ""}`}
                        >
                          B: {q.options?.[1] || ""}
                        </span>
                        <span
                          className={`opt-pill ${q.answerKey === "C" ? "is-correct-pill" : ""}`}
                        >
                          C: {q.options?.[2] || ""}
                        </span>
                        <span
                          className={`opt-pill ${q.answerKey === "D" ? "is-correct-pill" : ""}`}
                        >
                          D: {q.options?.[3] || ""}
                        </span>
                      </div>
                    </div>
                    <div className="row-action-buttons">
                      <button
                        type="button"
                        className="btn-action-edit"
                        onClick={() => handleTriggerEdit(q)}
                      >
                        <Edit3 size={15} /> Edit
                      </button>
                      <button
                        type="button"
                        className="btn-action-delete"
                        onClick={() =>
                          handleDeleteQuestion(q._id, q.questionNumber)
                        }
                      >
                        <Trash2 size={15} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
