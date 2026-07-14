import express from "express";
import {
  getLeaderboard,
  submitQuizResult,
} from "../controllers/quizController.js";

const router = express.Router();

// Matches the exact endpoint URL path your QuizEngine is firing to!
router.post("/leaderboard/submit", submitQuizResult);
router.get("/leaderboard", getLeaderboard);

export default router;
