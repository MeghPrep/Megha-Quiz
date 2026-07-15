import express from "express";
import {
  getLeaderboard,
  submitQuizResult,
  getStudentDashboardStats, // 🌟 Import the new controller method
} from "../controllers/quizController.js";

const router = express.Router();

router.post("/leaderboard/submit", submitQuizResult);
router.get("/leaderboard", getLeaderboard);

// 🌟 Clean Student Profile Dashboard endpoint mount point
router.get("/student-stats", getStudentDashboardStats);

export default router;
