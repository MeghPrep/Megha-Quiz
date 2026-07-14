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

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();
const PORT = 3000;

/* MIDDLEWARE */
app.use(
  cors({
    origin: ["http://localhost:5173", "https://megha-quiz.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

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

    // Check if the user record exists in your MongoDB Atlas cluster
    let userRecord = await users.findOne({ clerkId: userId });

    if (!userRecord) {
      // Pull missing registration properties from Clerk API servers
      const clerkUser = await clerkClient.users.getUser(userId);
      const emailAddress = clerkUser.emailAddresses?.[0]?.emailAddress || "";
      const fullName =
        `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();

      // Seed profile collection record matching your Mongoose Schema
      await users.create({
        clerkId: userId,
        fullName: fullName || "Guest User",
        email: emailAddress,
        role: "user",
        isLoggedIn: true,
      });
      console.log(`Successfully auto-synced user: ${fullName} to MongoDB!`);
    } else if (!userRecord.isLoggedIn) {
      userRecord.isLoggedIn = true;
      await userRecord.save();
    }

    next();
  } catch (error) {
    console.error("Global MongoDB user tracking sync failed:", error);
    next(); // Ensure user requests still load even if MongoDB sync experiences lag
  }
});

/* DB */
connectDB();

/* ROUTES */
app.use("/api/contact", contactRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/user", userRoutes);
app.use("/api/authority", authorityRoutes);
app.use("/api/recruitment", recruitmentRoutes);
app.use("/api/paper", paperRoutes);
app.use("/api/question", questionRoutes);

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
