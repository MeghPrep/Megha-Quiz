import mongoose from "mongoose";

const currentAffairQuestionSchema = new mongoose.Schema(
  {
    currentAffairs: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CurrentAffair",
      required: true,
    },
    questionNumber: { type: Number, required: true },
    question: { type: String, required: true },
    options: [{ type: String, required: true }], // Flat array of exactly 4 strings
    answerKey: { type: String, required: true }, // e.g., "A", "B", "C", "D"
    solution: { type: String, required: true }, // Detailed explanation panel
  },
  { timestamps: true },
);

currentAffairQuestionSchema.index({ currentAffairs: 1, questionNumber: 1 });

export default mongoose.model(
  "CurrentAffairQuestion",
  currentAffairQuestionSchema,
);
