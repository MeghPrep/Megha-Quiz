import mongoose from "mongoose";

const currentAffairSchema = new mongoose.Schema(
  {
    title: { type: String, default: "Meghalaya Current Affairs" },
    weekTitle: { type: String, required: true, unique: true }, // e.g., "6th - 12th July 2026"
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
  },
  { timestamps: true },
);

// Index for chronological publication ordering
currentAffairSchema.index({ updatedAt: -1 });

export default mongoose.model("CurrentAffair", currentAffairSchema);
