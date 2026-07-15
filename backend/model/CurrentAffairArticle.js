import mongoose from "mongoose";

const currentAffairArticleSchema = new mongoose.Schema(
  {
    currentAffairs: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CurrentAffair",
      required: true,
    },
    title: { type: String, required: true },
    summary: { type: String, required: true },
    content: { type: String, required: true }, // Supports multi-paragraph or markdown text
    image: { type: String, default: "" }, // URL pointing to cloud storage/assets
    graph: { type: String, default: "" }, // Graph/visualization asset reference
    examPoint: { type: String, required: true }, // Clear exam takeaway marker
    articleDate: { type: Date, required: true },
    articleOrder: { type: Number, default: 1 }, // Order of appearance in the newspaper feed
  },
  { timestamps: true },
);

currentAffairArticleSchema.index({ currentAffairs: 1, articleOrder: 1 });

export default mongoose.model(
  "CurrentAffairArticle",
  currentAffairArticleSchema,
);
