import QuizHistory from "../model/quizHistory.js";
import { getAuth } from "@clerk/express";
import users from "../model/users.js";

export const submitQuizResult = async (req, res) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized token payload." });
    }

    const {
      paperId,
      currentAffairsId,
      quizType,
      score,
      totalQuestions,
      accuracy,
      mode,
    } = req.body;

    if (score === undefined || !totalQuestions) {
      return res
        .status(400)
        .json({ success: false, message: "Missing evaluation parameters." });
    }

    // 🌟 Create the document based on the incoming quiz type profile mapping
    const newRecord = await QuizHistory.create({
      clerkId: userId,
      paperId: quizType === "currentAffairs" ? null : paperId,
      currentAffairsId: quizType === "currentAffairs" ? currentAffairsId : null,
      quizType: quizType || "regularPaper",
      score,
      totalQuestions,
      accuracy,
      mode: mode || "practice",
    });

    return res.status(201).json({
      success: true,
      message: "Quiz assessment historical log stored cleanly!",
      data: newRecord,
    });
  } catch (error) {
    console.error("MongoDB quiz submission write error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to persist score data cluster.",
    });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const { paperId } = req.query;
    let queryCondition = {};

    // 🌟 If a paperId is passed, look up that specific paper; otherwise, pull all submissions globally
    if (paperId) {
      queryCondition = { paperId };
    }

    // 1. Fetch scores sorted from highest score to lowest (capped at top 50 for performance)
    const histories = await QuizHistory.find(queryCondition)
      .sort({ score: -1, createdAt: 1 }) // Highest score first; tiebreaker to earlier completions
      .limit(50)
      .lean();

    // 2. Map through histories and inject user profile details from MongoDB users collection
    const rankedResults = await Promise.all(
      histories.map(async (history, index) => {
        const userProfile = await users.findOne({ clerkId: history.clerkId });

        return {
          rank: index + 1,
          clerkId: history.clerkId,
          candidateName: userProfile
            ? userProfile.fullName
            : "Anonymous Candidate",
          score: history.score,
          totalQuestions: history.totalQuestions,
          accuracy: `${history.accuracy}%`,
          timeTaken: history.timeTakenString || "12m 44s", // Pulling saved string values
          attemptDate: new Date(history.createdAt).toLocaleDateString("en-IN"),
        };
      }),
    );

    return res.status(200).json({
      success: true,
      leaderboard: rankedResults,
    });
  } catch (error) {
    console.error("Leaderboard query extraction error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error pulling rankings." });
  }
};

export const getStudentDashboardStats = async (req, res) => {
  try {
    const { userId } = getAuth(req);

    // Guard block protecting against unauthenticated requests
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized profile request token.",
      });
    }

    // 1. Fetch the logged-in candidate's synchronized baseline profile fields
    const userProfile = await users.findOne({ clerkId: userId });
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: "User profile workspace workspace synchronization pending.",
      });
    }

    // 2. Fetch past test performance records for this specific candidate (Newest attempts first)
    const attempts = await QuizHistory.find({ clerkId: userId })
      .sort({ createdAt: -1 })
      .populate("paperId", "paperTitle totalQuestions")
      .populate("currentAffairsId", "weekTitle")
      .lean();

    return res.status(200).json({
      success: true,
      profile: userProfile,
      attempts: attempts || [],
    });
  } catch (error) {
    console.error("Dashboard profile analytical query failure:", error);
    return res.status(500).json({
      success: false,
      message:
        "Internal server error extracting historical quiz summary matrix maps.",
    });
  }
};
