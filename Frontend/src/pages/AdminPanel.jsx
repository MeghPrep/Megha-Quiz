import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext.jsx";
import { PlusCircle, Layers, HelpCircle, Link2 } from "lucide-react";
import "../assets/AdminPanel.css";


function AdminPanel() {
  const { backendUrl, userId } = useContext(AppContext);

  // Structural cascading collections loaded from MongoDB Atlas
  const [authorities, setAuthorities] = useState([]);
  const [recruitments, setRecruitments] = useState([]);
  const [papers, setPapers] = useState([]);

  // Form Cascading Select Target State IDs
  const [selectedAuthorityId, setSelectedAuthorityId] = useState("");
  const [selectedRecruitmentId, setSelectedRecruitmentId] = useState("");
  const [selectedPaperId, setSelectedPaperId] = useState("");
  
  // Inline structural creation toggles
  const [isCreatingPaper, setIsCreatingPaper] = useState(false);
  const [newPaperForm, setNewPaperForm] = useState({
    paperTitle: "",
    examDate: "",
    timeAllowed: 60,
    totalMarks: 100,
    totalQuestions: 50,
    negativeMarking: false,
    examCode: ""
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
    answerKey: "A", // Backend Enum: ["A", "B", "C", "D"]
    solution: "",
    youtube: "",
  });

  const [loading, setLoading] = useState(false);

  // 1. Fetch Authorities list on component mount
  useEffect(() => {
    const fetchAuthorities = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/authority`);
        if (response.data.success) {
          setAuthorities(response.data.authorities);
        }
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
      setSelectedRecruitmentId("");
      setSelectedPaperId("");
      return;
    }
    const fetchRecruitments = async () => {
      try {
        // Uses the slug-intercept strategy implemented in recruitmentController.js
        const response = await axios.get(`${backendUrl}/api/recruitment?authorityId=${selectedAuthorityId}`);
        if (response.data.success) {
          setRecruitments(response.data.recruitment);
        }
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
      setSelectedPaperId("");
      return;
    }
    const fetchPapers = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/paper?recruitmentId=${selectedRecruitmentId}`);
        if (response.data.success) {
          setPapers(response.data.papers);
        }
      } catch (err) {
        toast.error("Error fetching examination question papers for this workflow.");
      }
    };
    fetchPapers();
  }, [selectedRecruitmentId, backendUrl]);

  // Handle submitting a newly initialized Paper structural record row
  const handleCreatePaper = async (e) => {
    e.preventDefault();
    if (!selectedRecruitmentId) {
      toast.warning("Please select a parent recruitment framework first.");
      return;
    }
    try {
      const payload = {
        recruitment: selectedRecruitmentId,
        ...newPaperForm
      };
      const response = await axios.post(`${backendUrl}/api/paper`, payload);
      if (response.data.success) {
        toast.success("New examination paper tier registered successfully!");
        setPapers([...papers, response.data.paper]);
        setSelectedPaperId(response.data.paper._id);
        setIsCreatingPaper(false);
        setNewPaperForm({
          paperTitle: "", examDate: "", timeAllowed: 60, totalMarks: 100, totalQuestions: 50, negativeMarking: false, examCode: ""
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to finalize new paper configuration mapping.");
    }
  };

  // Handle processing and pushing complete MCQ questions upstream to Mongoose routes
  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPaperId) {
      toast.warning("Please choose or target an explicit exam paper module container first.");
      return;
    }

    setLoading(true);
    
    // Normalizes isolated form inputs into a flat 4-item array required by Mongoose validation bounds
    const optionsArray = [
      questionForm.optionA.trim(),
      questionForm.optionB.trim(),
      questionForm.optionC.trim(),
      questionForm.optionD.trim()
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
      createdBy: userId || "AdminManualEntry" // Attaches clerk token string trace parameters required by schema
    };

    try {
      const response = await axios.post(`${backendUrl}/api/question`, payload);
      if (response.data.success) {
        toast.success("MCQ Question uploaded to Atlas successfully!");
        
        // Advance question number row counter smoothly for rapid consecutive entries
        setQuestionForm(prev => ({
          ...prev,
          questionNumber: prev.questionNumber + 1,
          question: "", optionA: "", optionB: "", optionC: "", optionD: "",
          solution: "", youtube: ""
        }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to append question to backend model context rules.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-panel-layout-wrapper">
      <div className="admin-hero-banner">
        <h1>Megha Quiz Admin Control Panel</h1>
        <p>Digitize official MPSC exam question booklets, link parent structural workflows, and save keys cleanly.</p>
      </div>

      <div className="admin-container">
        
        {/* ROW COLUMN SECTION 1: RELATIONAL STRUCTURAL HOOKING */}
        <section className="admin-card-section">
          <h2><Layers size={18} /> Step 1: Target Relational Nesting Cascade</h2>
          <div className="admin-selection-grid">
            
            <div className="admin-input-group">
              <label>Select Parent Authority Cadre</label>
              <select value={selectedAuthorityId} onChange={(e) => { setSelectedAuthorityId(e.target.value); setSelectedRecruitmentId(""); setSelectedPaperId(""); }}>
                <option value="">-- Choose Authority --</option>
                {authorities.map(a => <option key={a._id} value={a.id}>{a.name} ({a.shortName.toUpperCase()})</option>)}
              </select>
            </div>

            <div className="admin-input-group">
              <label>Select Parent Recruitment</label>
              <select value={selectedRecruitmentId} onChange={(e) => { setSelectedRecruitmentId(e.target.value); setSelectedPaperId(""); }} disabled={!selectedAuthorityId}>
                <option value="">-- Choose Recruitment Framework --</option>
                {recruitments.map(r => <option key={r._id} value={r._id}>{r.postName} - ({r.advertisementYear})</option>)}
              </select>
            </div>

            <div className="admin-input-group">
              <label>Select Target Question Paper Booklet</label>
              <div className="topic-select-row">
                <select value={selectedPaperId} onChange={(e) => setSelectedPaperId(e.target.value)} disabled={isCreatingPaper || !selectedRecruitmentId}>
                  <option value="">-- Choose Target Paper --</option>
                  {papers.map(p => <option key={p._id} value={p._id}>{p.paperTitle}</option>)}
                </select>
                <button type="button" className="toggle-creation-btn" onClick={() => setIsCreatingPaper(!isCreatingPaper)} disabled={!selectedRecruitmentId}>
                  {isCreatingPaper ? "Cancel" : "Add New Paper"}
                </button>
              </div>
            </div>

          </div>

          {/* DYNAMIC SUBMISSION FOR REGISTERING A MISSING BOOKLET DIRECTLY */}
          {isCreatingPaper && (
            <form onSubmit={handleCreatePaper} className="inline-add-topic-form-expanded">
              <h3>Create Missing Exam Booklet Frame</h3>
              <div className="options-input-grid">
                <input type="text" placeholder="Paper Title (e.g. Paper II: English)" value={newPaperForm.paperTitle} onChange={(e) => setNewPaperForm({...newPaperForm, paperTitle: e.target.value})} required />
                <input type="date" value={newPaperForm.examDate} onChange={(e) => setNewPaperForm({...newPaperForm, examDate: e.target.value})} required />
                <input type="number" placeholder="Duration (Mins)" value={newPaperForm.timeAllowed} onChange={(e) => setNewPaperForm({...newPaperForm, timeAllowed: e.target.value})} required />
<input type="number" placeholder="Total Marks" value={newPaperForm.totalMarks} onChange={(e) => setNewPaperForm({...newPaperForm, totalMarks: e.target.value})} required />
                <input type="number" placeholder="Total Questions" value={newPaperForm.totalQuestions} onChange={(e) => setNewPaperForm({...newPaperForm, totalQuestions: e.target.value})} required />
                <input type="text" placeholder="Exam Code (Optional)" value={newPaperForm.examCode} onChange={(e) => setNewPaperForm({...newPaperForm, examCode: e.target.value})} />
                <label className="checkbox-holder">
                  <input type="checkbox" checked={newPaperForm.negativeMarking} onChange={(e) => setNewPaperForm({...newPaperForm, negativeMarking: e.target.checked})} /> Negative Marking?
                </label>
              </div>
              <button type="submit" className="btn-admin-submit"><PlusCircle size={16} /> Save New Paper Record</button>
            </form>
          )}
        </section>

        {/* ROW COLUMN SECTION 2: QUESTION DATA FIELD ENTRY */}
        <form onSubmit={handleQuestionSubmit} className="admin-card-section input-forms-block">
          <h2><HelpCircle size={18} /> Step 2: Input Question Content Fields</h2>

          <div className="options-input-grid" style={{ gridTemplateColumns: "1fr 2fr 2fr" }}>
            <div className="admin-input-group">
              <label>Question No.</label>
              <input type="number" min={1} value={questionForm.questionNumber} onChange={(e) => setQuestionForm({...questionForm, questionNumber: e.target.value})} required />
            </div>
            <div className="admin-input-group">
              <label>Section Heading (Optional)</label>
              <input type="text" placeholder="e.g. Indian Polity" value={questionForm.sectionTitle} onChange={(e) => setQuestionForm({...questionForm, sectionTitle: e.target.value})} />
            </div>
            <div className="admin-input-group">
              <label>Correct Evaluation Answer Key</label>
              <select value={questionForm.answerKey} onChange={(e) => setQuestionForm({...questionForm, answerKey: e.target.value})}>
                <option value="A">Option A</option>
                <option value="B">Option B</option>
                <option value="C">Option C</option>
                <option value="D">Option D</option>
              </select>
            </div>
          </div>

          <div className="admin-input-group full-width-field">
            <label>Comprehension Passage / Context Scenario Text (Optional)</label>
            <textarea rows={2} placeholder="Paste common analytical passage block if question references a text context case..." value={questionForm.passage} onChange={(e) => setQuestionForm({...questionForm, passage: e.target.value})} />
          </div>

          <div className="admin-input-group full-width-field">
            <label>Question Stem Core Text Statement</label>
            <textarea rows={3} placeholder="Type the core MCQ question query description prompt text here..." value={questionForm.question} onChange={(e) => setQuestionForm({...questionForm, question: e.target.value})} required />
          </div>

          <div className="options-input-grid">
            <div className="admin-input-group"><label>Option A Content String</label><input type="text" value={questionForm.optionA} onChange={(e) => setQuestionForm({...questionForm, optionA: e.target.value})} required /></div>
            <div className="admin-input-group"><label>Option B Content String</label><input type="text" value={questionForm.optionB} onChange={(e) => setQuestionForm({...questionForm, optionB: e.target.value})} required /></div>
            <div className="admin-input-group"><label>Option C Content String</label><input type="text" value={questionForm.optionC} onChange={(e) => setQuestionForm({...questionForm, optionC: e.target.value})} required /></div>
            <div className="admin-input-group"><label>Option D Content String</label><input type="text" value={questionForm.optionD} onChange={(e) => setQuestionForm({...questionForm, optionD: e.target.value})} required /></div>
          </div>

          <div className="admin-input-group full-width-field">
            <label>Detailed Solution Rationale, Rationale Text & Explanations</label>
            <textarea rows={4} placeholder="Provide deep context, breakdown insights and reference data regarding the correct choice..." value={questionForm.solution} onChange={(e) => setQuestionForm({...questionForm, solution: e.target.value})} required />
          </div>

          <h2><Link2 size={18} /> Step 3: Embed Video Explanations (Optional)</h2>
          <div className="admin-input-group full-width-field">
            <label>YouTube Explanatory Video Link</label>
            <input type="url" placeholder="https://youtube.com..." value={questionForm.youtube} onChange={(e) => setQuestionForm({...questionForm, youtube: e.target.value})} />
          </div>

          <button type="submit" className="master-upload-btn" disabled={loading || !selectedPaperId}>
            {loading ? "Persisting JSON Records to MongoDB Atlas..." : "Save and Upload Question Item"}
          </button>
        </form>

      </div>
    </div>
  );
}

export default AdminPanel;
