import express from "express";
import CurrentAffair from "../model/CurrentAffair.js";
import CurrentAffairArticle from "../model/CurrentAffairArticle.js";
import CurrentAffairQuestion from "../model/CurrentAffairQuestion.js";

const router = express.Router();

// 1. GET ALL ISSUES (Sorted by date modified for the main timeline display)
router.get("/", async (req, res) => {
  try {
    const issues = await CurrentAffair.find({ status: "published" }).sort({
      updatedAt: -1,
    });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: "Failed to load current affairs stream." });
  }
});

// 2. GET SINGLE ISSUE DETAILS + RELEVANT NEWS ARTICLES ONLY
router.get("/:id", async (req, res) => {
  try {
    const issue = await CurrentAffair.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: "Issue not found" });

    const articles = await CurrentAffairArticle.find({
      currentAffairs: req.params.id,
    }).sort({ articleOrder: 1 });

    res.json({ issue, articles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. GET QUESTIONS BY CURRENT AFFAIRS ID (Targeted endpoint for your QuizEngine)
router.get("/:id/questions", async (req, res) => {
  try {
    const questions = await CurrentAffairQuestion.find({
      currentAffairs: req.params.id,
    })
      .sort({ questionNumber: 1 })
      .select("_id question options answerKey solution"); // Normalizes field keys to match original model structure

    res.json(questions);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to extract revision questions pool." });
  }
});

export default router;
