import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext.jsx";
import { PlusCircle, Save, BookOpen, Layers, HelpCircle, Link2 } from "lucide-react";

function AdminPanel() {
  const { backendUrl } = useContext(AppContext);

  // Structural Collections Array Lists loaded from Atlas
  const [exams, setExams] = useState([]);
  const [topics, setTopics] = useState([]);

  // Form Processing State Targets
  const [selectedExamId, setSelectedExamId] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  
  // Inline dynamic new data toggles
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);

  // Core Question Schema Input Object
  const [questionForm, setQuestionForm] = useState({
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: 0, // Index 0=A, 1=B, 2=C, 3=D
    explanation: "",
    pdfNotesUrl: "",
    videoExplanationUrl: "",
  });

  const [loading, setLoading] = useState(false);

  // Fetch base exams list on mount
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await axios.get(`${backendUrl}api/quiz/exams`);
        if (response.data.success) setExams(response.data.data);
      } catch (err) {
        toast.error("Failed to load active exams into dropdown menu.");
      }
    };
    fetchExams();
  }, [backendUrl]);

  // Dynamically load cascading nested sub-topics whenever parent exam flips
  useEffect(() => {
    if (!selectedExamId) {
      setTopics([]);
      return;
    }
    const fetchTopics = async () => {
      try {
        const response = await axios.get(`${backendUrl}api/quiz/exams/${selectedExamId}/topics`);
        if (response.data.success) setTopics(response.data.data);
      } catch (err) {
        toast.error("Error loading nested topics for this selection.");
      }
    };
    fetchTopics();
  }, [selectedExamId, backendUrl]);

  // Handle submitting a newly created nested Topic row entry
  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!selectedExamId || !newTopicTitle.trim()) {
      toast.warning("Please select a parent Exam category first.");
      return;
    }
    try {
      const response = await axios.post(`${backendUrl}/api/quiz/topics/create`, {
        examId: selectedExamId,
        title: newTopicTitle.trim()
      });
      if (response.data.success) {
        toast.success("New topic created successfully!");
        setTopics([...topics, response.data.data]);
        setSelectedTopicId(response.data.data._id);
        setNewTopicTitle("");
        setIsCreatingTopic(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create new topic entry.");
    }
  };

  // Handle uploading the finalized nested question schema item
  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTopicId) {
      toast.warning("Please choose or target a specific sub-topic module first.");
      return;
    }

    setLoading(true);
    const optionsArray = [questionForm.optionA, questionForm.optionB, questionForm.optionC, questionForm.optionD];

    const payload = {
      topicId: selectedTopicId,
      question: questionForm.question,
      options: optionsArray,
      correctAnswer: Number(questionForm.correctAnswer),
      explanation: questionForm.explanation,
      pdfNotesUrl: questionForm.pdfNotesUrl,
      videoExplanationUrl: questionForm.videoExplanationUrl,
    };

    try {
      const response = await axios.post(`${backendUrl}/api/quiz/questions/create`, payload);
      if (response.data.success) {
        toast.success("MCQ Question uploaded to Atlas successfully!");
        // Reset form variables while preserving topic/exam selections for faster bulk entries!
        setQuestionForm({
          question: "", optionA: "", optionB: "", optionC: "", optionD: "",
          correctAnswer: 0, explanation: "", pdfNotesUrl: "", videoExplanationUrl: ""
        });
      }
    } catch (err) {
      toast.error("Failed to append question to your database model configuration.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="admin-panel-layout-wrapper">
      <div className="admin-hero-banner">
        <h1>Megha Quiz Admin Control Panel</h1>
        <p>Digitize official MPSC exam question booklets, organize topics, and link study reference tools.</p>
      </div>

      <div className="admin-container">
        
        {/* ROW COLUMN SECTION 1: RELATIONAL STRUCTURE HOOKING */}
        <section className="admin-card-section">
          <h2><Layers size={18} /> Step 1: Target Relational Nesting</h2>
          <div className="admin-selection-grid">
            
            <div className="admin-input-group">
              <label>Select Parent Exam Cadre</label>
              <select value={selectedExamId} onChange={(e) => { setSelectedExamId(e.target.value); setSelectedTopicId(""); }}>
                <option value="">-- Choose Exam Category --</option>
                {exams.map(e => <option key={e._id} value={e._id}>{e.name} ({e.category})</option>)}
              </select>
            </div>

            <div className="admin-input-group">
              <label>Select Nested Topic/Paper</label>
              <div className="topic-select-row">
                <select value={selectedTopicId} onChange={(e) => setSelectedTopicId(e.target.value)} disabled={isCreatingTopic}>
                  <option value="">-- Choose Sub Topic --</option>
                  {topics.map(t => <option key={t._id} value={t._id}>{t.title}</option>)}
                </select>
                <button type="button" className="toggle-creation-btn" onClick={() => setIsCreatingTopic(!isCreatingTopic)}>
                  {isCreatingTopic ? "Cancel" : "Add New"}
                </button>
              </div>
            </div>

          </div>

          {/* HIDDEN INLINE NEW TOPIC SUBMISSION SHELL */}
          {isCreatingTopic && (
            <form onSubmit={handleCreateTopic} className="inline-add-topic-form">
              <input type="text" placeholder="e.g., General English - Section I" value={newTopicTitle} onChange={(e) => setNewTopicTitle(e.target.value)} required />
              <button type="submit" className="btn-admin-submit"><PlusCircle size={16} /> Save Topic</button>
            </form>
          )}
        </section>

        <form onSubmit={handleQuestionSubmit} className="admin-card-section input-forms-block">
          <h2><HelpCircle size={18} /> Step 2: Input Question Content Fields</h2>

          <div className="admin-input-group full-width-field">
            <label>Question Stem Statement</label>
            <textarea rows={3} placeholder="Type the question query text here..." value={questionForm.question} onChange={(e) => setQuestionForm({...questionForm, question: e.target.value})} required />
          </div>

          <div className="options-input-grid">
            <div className="admin-input-group"><label>Option A</label><input type="text" value={questionForm.optionA} onChange={(e) => setQuestionForm({...questionForm, optionA: e.target.value})} required /></div>
            <div className="admin-input-group"><label>Option B</label><input type="text" value={questionForm.optionB} onChange={(e) => setQuestionForm({...questionForm, optionB: e.target.value})} required /></div>
            <div className="admin-input-group"><label>Option C</label><input type="text" value={questionForm.optionC} onChange={(e) => setQuestionForm({...questionForm, optionC: e.target.value})} required /></div>
            <div className="admin-input-group"><label>Option D</label><input type="text" value={questionForm.optionD} onChange={(e) => setQuestionForm({...questionForm, optionD: e.target.value})} required /></div>
          </div>

          <div className="admin-selection-grid">
            <div className="admin-input-group">
              <label>Correct Choice Pointer Target</label>
              <select value={questionForm.correctAnswer} onChange={(e) => setQuestionForm({...questionForm, correctAnswer: e.target.value})}>
                <option value={0}>Option A</option>
                <option value={1}>Option B</option>
                <option value={2}>Option C</option>
                <option value={3}>Option D</option>
              </select>
            </div>
          </div>

          <div className="admin-input-group full-width-field">
            <label>Detailed Solution Rationale & Explanation</label>
            <textarea rows={4} placeholder="Provide deep context and reference data regarding the correct selection..." value={questionForm.explanation} onChange={(e) => setQuestionForm({...questionForm, explanation: e.target.value})} required />
          </div>

          <h2><Link2 size={18} /> Step 3: Embed Tooltip Resource Links (Optional)</h2>
          <div className="admin-selection-grid">
            <div className="admin-input-group"><label>Google Drive Notes PDF Link</label><input type="url" placeholder="https://google.com..." value={questionForm.pdfNotesUrl} onChange={(e) => setQuestionForm({...questionForm, pdfNotesUrl: e.target.value})} /></div>
            <div className="admin-input-group"><label>YouTube Video Explanation Link</label><input type="url" placeholder="https://youtube.com..." value={questionForm.videoExplanationUrl} onChange={(e) => setQuestionForm({...questionForm, videoExplanationUrl: e.target.value})} /></div>
          </div>

          <button type="submit" className="master-upload-btn" disabled={loading || !selectedTopicId}>
            {loading ? "Uploading to Atlas Cluster..." : "Save and Upload Question"}
          </button>
        </form>

      </div>
    </div>
  )
}

export default AdminPanel