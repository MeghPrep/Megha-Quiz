import mongoose from "mongoose";

const papersSchema = new mongoose.Schema(
  {
    recruitment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "recruitments",
      required: true,
    },
    paperTitle: {
      type: String,
      required: true,
      trim: true,
    },
    examDate: {
      type: Date,
      required: true,
    },
    timeAllowed: {
      type: Number,
      required: true,
      min: 1,
    },
    totalMarks: {
      type: Number,
      required: true,
      min: 1,
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
    },
    negativeMarking: {
      type: Boolean,
      required: true,
    },
    instructions: {
      type: String,
      default: `Welcome to Megha Quiz!

		• Read every question carefully before answering.
		• Choose the best answer from the four options.
		• Use the Question Palette to navigate between questions.
		• Your progress is saved automatically while the quiz is in progress.
		• In Mock Mode, complete the quiz within the allotted time.
		• In Practice Mode, you may answer at your own pace.
		• Review and change your answers before submitting the quiz.
		• Click Submit when you have finished the quiz.

		Good luck!`,
      trim: true,
    },
    pdf: {
      type: String,
      default: "",
      trim: true,
    },
    youtube: {
      type: String,
      default: "",
      trim: true,
    },
    examCode: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  },
);

const papers = mongoose.model("papers", papersSchema);
export default papers;
