import mongoose from "mongoose";

const quizHistorySchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      trim: true,
    },
    // 🌟 REMOVED required: true to support both types of quiz records gracefully
    paperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "papers",
      required: false,
    },
    // 📰 ADDED: Reference pointer mapping to link Current Affairs editions cleanly
    currentAffairsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CurrentAffair", // Matches your current affairs parent model string
      required: false,
    },
    // 🎯 ADDED: Simple type marker indicator to index histories efficiently
    quizType: {
      type: String,
      enum: ["regularPaper", "currentAffairs"],
      default: "regularPaper",
    },
    score: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    accuracy: {
      type: Number, // Stores as plain number integer (e.g. 88)
      required: true,
    },
    mode: {
      type: String,
      enum: ["practice", "mock"],
      default: "practice",
    },
  },
  {
    timestamps: true,
  },
);

const QuizHistory = mongoose.model("quizHistories", quizHistorySchema);
export default QuizHistory;
