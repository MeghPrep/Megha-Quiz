import mongoose from "mongoose";

const questionsSchema = new mongoose.Schema(
  {
    paper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "papers",
      required: true,
    },
    questionNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    sectionTitle: {
      type: String,
      default: "",
      trim: true,
    },
    passage: {
      type: String,
      default: "",
      trim: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      default: [],
      required: true,
      validate: {
        validator: (v) =>
          v.length === 4 && v.every((option) => option && option.trim()),
        message: "Each question must contain exactly 4 valid options.",
      },
    },
    answerKey: {
      type: String,
      required: true,
      uppercase: true,
      enum: ["A", "B", "C", "D"],
    },
    solution: {
      type: String,
      default: "",
      trim: true,
    },

    youtube: {
      type: String,
      default: "",
      trim: true,
    },

    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  },
);

questionsSchema.virtual("answerText").get(function () {
  const map = {
    A: 0,
    B: 1,
    C: 2,
    D: 3,
  };
  return this.options[map[this.answerKey]] || "";
});

const questions = mongoose.model("questions", questionsSchema);

export default questions;
