import dns from "dns";
import express from "express";
import cors from "cors";
import "dotenv/config";
import { getAuth, clerkClient, clerkMiddleware } from "@clerk/express"; // 🌟 Added getAuth and clerkClient
import { connectDB } from "./config/db.js";
import users from "./model/users.js"; // 🌟 Import your users mongoose model
import userRoutes from "./routes/userRoutes.js";

import authorityRoutes from "./routes/authorityRoutes.js";
import recruitmentRoutes from "./routes/recruitmentRoutes.js";
import paperRoutes from "./routes/paperRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";

// 📰 IMPORT CURRENT AFFAIRS ISOLATED ROUTER
import currentAffairsRoutes from "./routes/currentAffairs.js";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();
const PORT = 3000;

/* CORS MIDDLEWARE */
app.use(
  cors({
    origin: ["http://localhost:5173", "https://megha-quiz.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ==========================================================================
// 🔒 1. CLERK WEBHOOK ROUTE (CRITICAL: MUST SIT ABOVE express.json())
// ==========================================================================
app.use("/api/user", userRoutes); // Contains your express.raw() /webhook/clerk receiver path

// ==========================================================================
// ⚙️ 2. STANDARD BODY PARSERS & AUTH UTILITIES
// ==========================================================================
app.use(express.json());
app.use(clerkMiddleware());

// 🌟 GLOBAL AUTO-SYNC HOOK: Runs on every single API request to save users automatically
app.use(async (req, res, next) => {
  try {
    const { userId } = getAuth(req);

    // If guest / not logged in, skip the database sync routine completely
    if (!userId) {
      return next();
    }

    // Pull full profile details directly from Clerk using backend client SDK
    const clerkUser = await clerkClient.users.getUser(userId);
    const profilePicture = clerkUser.imageUrl || ""; // 🌟 Extract Gmail image URL path

    // Check if the user record exists in your MongoDB Atlas cluster
    let userRecord = await users.findOne({ clerkId: userId });

    if (!userRecord) {
      const emailAddress = clerkUser.emailAddresses?.[0]?.emailAddress || "";
      const fullName =
        `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();

      // Seed profile collection record matching your Mongoose Schema
      await users.create({
        clerkId: userId,
        fullName: fullName || "Guest User",
        email: emailAddress,
        profileImage: profilePicture, // 🌟 Save profile picture to DB on creation
        role: "user",
        isLoggedIn: true,
      });
      console.log(`Successfully auto-synced user: ${fullName} to MongoDB!`);
    } else {
      // 🌟 FALLBACK: If user already exists but has no picture or info has changed, sync it!
      let elementsChanged = false;

      if (
        !userRecord.profileImage ||
        userRecord.profileImage !== profilePicture
      ) {
        userRecord.profileImage = profilePicture;
        elementsChanged = true;
      }

      if (!userRecord.isLoggedIn) {
        userRecord.isLoggedIn = true;
        elementsChanged = true;
      }

      if (elementsChanged) {
        await userRecord.save();
      }
    }

    next();
  } catch (error) {
    console.error("Global MongoDB user tracking sync failed:", error);
    next(); // Ensure user requests still load even if MongoDB sync experiences lag
  }
});

/* DB LINK */
connectDB();

/* CORE PLATFORM ROUTES */
app.use("/api/contact", contactRoutes);
app.use("/api/quiz", quizRoutes);
// Note: app.use("/api/user", userRoutes) was safely mounted above body parsers for webhook integrity

app.use("/api/authority", authorityRoutes);
app.use("/api/recruitment", recruitmentRoutes);
app.use("/api/paper", paperRoutes);
app.use("/api/question", questionRoutes);

// 📰 MOUNT CURRENT AFFAIRS MODULE ROUTER
app.use("/api/current-affairs", currentAffairsRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API WORKING" });
});

// FIX 1: Turn off persistent port listening when running in production cloud environments
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`server started locally on http://localhost:${PORT}`);
  });
}

export default app;
