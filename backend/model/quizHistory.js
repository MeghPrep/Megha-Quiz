import mongoose from "mongoose";

const quizHistorySchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      trim: true,
    },
    paperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "papers",
      required: true,
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
